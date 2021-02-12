const Twit = require('twit');
const { wrapTwitterErrors, errors } = require('twitter-error-handler');
// const arrgh = require('aa')
const {
  isTweetAReply,
  isTweetAReplyToMe,
  filterTweetImages,
  doesTweetHaveAtLeastTwoPhotos,
} = require('../utils/tweetUtils');
const { not, and, pluck } = require('../utils/utils');
require('dotenv').config();

const T = new Twit({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

module.exports = {
  getAllMentions: async () => {
    let allTweets = [];
    return T.get('statuses/mentions_timeline', {
      // since_id: 1357914189273170000,
      // count: 2,
    })
      .then((r) => r.data)
      .then((tweets) =>
        tweets.filter(and(isTweetAReply, not(isTweetAReplyToMe)))
      )
      .then((tweets) => {
        allTweets = tweets.map((tweetObject) => {
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
      .catch((e) => console.log('error', e));
  },

  getReferencedTweets: (tweets) => {
    return T.post(`statuses/lookup`, {
      id: pluck(tweets, 'referencing_tweet'),
      tweet_mode: 'extended',
    })
      .then((r) => r.data)
      .then((tweets) => tweets.filter(and(filterTweetImages)))
      .then((tweets) => {
        const allTweets = tweets.map((tweetObject) => {
          return {
            id: tweetObject.id_str,
            time: tweetObject.created_at,
            author: tweetObject.user.screen_name,
            media: tweetObject.extended_entities.media,
          };
        });
        return allTweets;
        // return tweets;
      })
      .then((tweets) => tweets.filter(and(doesTweetHaveAtLeastTwoPhotos)))
      .catch((e) => wrapTwitterErrors('statuses/lookup', e));
  },

  reply: async (tweet, content) => {
    let options = {
      in_reply_to_status_id: tweet.id,
      status: `@${tweet.author} ${content}`,
    };
    return T.post('statuses/update', options)
      .catch((e) => wrapTwitterErrors('statuses/update', e))
      .catch((e) => {
        console.log(e);
      });
  },
};

// const getTweets = () => {};

// getTweets();
