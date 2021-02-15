const cache = require('./db/cache');
const { joinImages } = require('./helpers/imageHelpers');
const twitterOps = require('./helpers/twitterOps');
const { pluck, random } = require('./utils/utils');
require('./db/mongoose');
require('dotenv').config();

const replies = [
  "Hi boss, here's your picture",
  "Done! Here's your picture",
  'Your pictures have been merged',
];

const mergeImg = async () => {
  const tweets = await twitterOps.getAllMentions();
  if (tweets.length) {
    cache.setItem('lastTweetId', tweets[0].id);
  }

  const results = await twitterOps.getReferencedTweets(tweets);
  const entries = results.map(result => ({
    ...result,
    images: pluck(result.media, 'media_url_https'),
  }));

  entries.forEach(async (entry, i) => {
    joinImages(entry.id, entry.images).then(async image => {
      // console.log(image);
      if (image) {
        await twitterOps.replyWithPhoto(image, entry, random(replies));
      }
    });
  });
};

// every two minutes
setInterval(async () => mergeImg(), 1000 * 120);
