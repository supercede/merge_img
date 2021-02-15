const express = require('express');
const cache = require('./db/cache');
const { joinImages } = require('./helpers/imageHelpers');
const twitterOps = require('./helpers/twitterOps');
const { pluck } = require('./utils/utils');
require('./db/mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/tweets', async (req, res) => {
  const tweets = await twitterOps.getAllMentions();

  if (tweets.length) {
    cache.setItem('lastTweetId', tweets[0].id);
  }
  const results = await twitterOps.getReferencedTweets(tweets);

  const entries = results.map(result => ({
    id: result.id,
    images: pluck(result.media, 'media_url_https'),
    author: result.author,
    mention_id: result.mention_id,
    mention_author: result.mention_author,
  }));

  entries.forEach(async entry => {
    console.log(entry);
    joinImages(entry.id, entry.images);
    // .then(async () => await dbHelpers.getImage(entry.mention_id))
    // .then(async image => {
    //   // console.log(image);
    //   if (image) {
    //     await twitterOps.replyWithPhoto(image, entry, "Hi boss, here's your picture");
    //   }
    // });
  });

  return res.send('OK');
});

app.listen(5000, () => {
  console.log('app listening on port 5000');
});
