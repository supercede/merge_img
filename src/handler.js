const cache = require('./db/cache');
const { joinImages } = require('./helpers/imageHelpers');
const twitterOps = require('./helpers/twitterOps');
const { pluck } = require('./utils/utils');
require('./db/mongoose');
require('dotenv').config();

const mergeImg = async () => {
  console.log('omo');
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
    console.log('join', i);
    joinImages(entry.id, entry.images)
      // .then(async () => await dbHelpers.getImage(entry.mention_id))
      .then(async image => {
        // console.log(image);
        console.log('reply', i);
        if (image) {
          await twitterOps.replyWithPhoto(image, entry, "Hi boss, here's your picture");
        }
      });
  });
};

setInterval(async () => mergeImg(), 1000 * 120);
