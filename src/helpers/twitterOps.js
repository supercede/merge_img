// /* eslint-disable */
const Twit = require('twit');
const { wrapTwitterErrors, errors } = require('twitter-error-handler');
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
    console.log('lastTweetId', lastTweetId);
    let allTweets = [];
    const options = {};

    if (lastTweetId) {
      options.since_id = lastTweetId;
    }
    return T.get('statuses/mentions_timeline', options)
      .then(r => r.data)
      .then(tweets => tweets.filter(and(isTweetAReply, not(isTweetAReplyToMe))))
      .then(tweets => {
        allTweets = tweets.map(tweetObject => {
          return {
            id: tweetObject.id_str,
            time: tweetObject.created_at,
            referencing_tweet: tweetObject.in_reply_to_status_id_str,
            author: tweetObject.user.screen_name,
          };
        });
        return allTweets;
        // return tweets;
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

  replyWithPhoto: async (media, tweet, content) => {
    console.log('1');
    return T.post('media/upload', { media }, (err, data, response) => {
      // now we can assign alt text to the media, for use by screen readers and
      // other text-based presentations and interpreters
      // console.log('err', err);
      console.log('err', err);
      console.log('response', response.statusMessage);

      const mediaIdStr = data.media_id_string;
      // const altText =
      //   'Small flowers in a planter on a sunny balcony, blossoming.';
      const meta_params = { media_id: mediaIdStr };
      console.log('2');

      if (!err) {
        T.post('media/metadata/create', meta_params, (err, data, response) => {
          if (!err) {
            // now we can reference the media and post a tweet (media will attach to the tweet)
            const params = {
              status: `@${tweet.mention_author} ${content}`,
              media_ids: [mediaIdStr],
              in_reply_to_status_id: tweet.mention_id,
            };

            console.log('3');

            if (!err) {
              T.post('statuses/update', params)
                .then(res => console.log)
                .catch(e => wrapTwitterErrors('statuses/update', e))
                .catch(e => {
                  console.log(e);
                });
            }
          }
        });
      }
    });
  },

  reply: async (tweet, content) => {
    const options = {
      in_reply_to_status_id: tweet.id,
      status: `@${tweet.author} ${content}`,
    };
    return T.post('statuses/update', options)
      .catch(e => wrapTwitterErrors('statuses/update', e))
      .catch(e => {
        console.log(e);
      });
  },
};

// const getTweets = () => {};

// getTweets();
