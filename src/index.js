const express = require('express');
const fs = require('fs');
const { joinImages } = require('./helpers/imageHelpers');
const twitterOps = require('./helpers/twitterOps');
const { pluck } = require('./utils/utils');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  return res.send({ message: 'hello' });
});

app.get('/tweets', async (req, res) => {
  const tweets = await twitterOps.getAllMentions();
  const results = await twitterOps.getReferencedTweets(tweets);

  const imgURLs = results.map((result) =>
    pluck(result.media, 'media_url_https')
  );

  for (let imgs of imgURLs) {
    await joinImages(imgs);
  }

  // await joinImages(imgURLs[0]);

  return res.status(200).json({
    results,
  });
});

app.post('/images', async (req, res) => {
  const imgs = req.body.images;

  if (!imgs || imgs.length < 2) {
    return res.status(400).json({
      message: 'Invalid Image length',
    });
  }

  await joinImages(imgs);
  return res.send({ message: 'Done' });
});

app.listen(5000, () => {
  console.log('app listening on port 5000');
});
