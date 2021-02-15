// /* eslint-disable */
const Twit = require('twit');
const { wrapTwitterErrors } = require('twitter-error-handler');
const {
  isTweetAReply,
  isTweetAReplyToMe,
  filterTweetImages,
  doesTweetHaveAtLeastTwoPhotos,
} = require('../utils/tweetUtils');
const { not, and, pluck } = require('../utils/utils');
const cache = require('../db/cache');
require('dotenv').config();

const T = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

module.exports = {
  getAllMentions: async lastTweet => {
    const lastTweetId = lastTweet || (await cache.getItem('lastTweetId'));
    let allTweets = [];
    const options = {};

    if (lastTweetId) {
      options.since_id = lastTweetId;
    }
    return T.get('statuses/mentions_timeline', options)
      .then(r => r.data)
      .then(tweets => tweets.filter(and(isTweetAReply, not(isTweetAReplyToMe))))
      .then(tweets => {
        allTweets = tweets.map(tweetObject => ({
          id: tweetObject.id_str,
          time: tweetObject.created_at,
          referencing_tweet: tweetObject.in_reply_to_status_id_str,
          author: tweetObject.user.screen_name,
        }));

        return allTweets;
      })
      .catch(e => console.log('error', e));
  },

  getReferencedTweets: mentions =>
    T.post('statuses/lookup', {
      id: pluck(mentions, 'referencing_tweet'),
      tweet_mode: 'extended',
    })
      .then(r => r.data)
      .then(tweets => tweets.filter(and(filterTweetImages)))
      .then(tweets => {
        const allTweets = tweets.map(tweetObject => {
          const mentionId = mentions.find(
            mention => mention.referencing_tweet === tweetObject.id_str,
          );

          return {
            id: tweetObject.id_str,
            time: tweetObject.created_at,
            author: tweetObject.user.screen_name,
            media: tweetObject.extended_entities.media,
            mention_id: mentionId.id,
            mention_author: mentionId.author,
          };
        });
        return allTweets;
        // return tweets;
      })
      .then(tweets => tweets.filter(and(doesTweetHaveAtLeastTwoPhotos)))
      .catch(e => wrapTwitterErrors('statuses/lookup', e)),

  replyWithPhoto: async (media, tweet, content) =>
    // Upload photo
    T.post('media/upload', { media }, (err, data, response) => {
      const mediaIdStr = data.media_id_string;
      const meta_params = { media_id: mediaIdStr };
      console.log('added media');

      // add media data to uploaded photo
      if (!err) {
        T.post('media/metadata/create', meta_params, (err, data, response) => {
          if (!err) {
            // now we can reference the media and post a tweet (media will attach to the tweet)
            const params = {
              status: `@${tweet.mention_author} ${content}`,
              media_ids: [mediaIdStr],
              in_reply_to_status_id: tweet.mention_id,
            };

            console.log('replied');

            if (!err) {
              T.post('statuses/update', params)
                .catch(e => wrapTwitterErrors('statuses/update', e))
                .catch(e => {
                  console.log(e);
                });
            }
          }
        });
      }
    }),
};
