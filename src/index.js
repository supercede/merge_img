const { response } = require('express');
const express = require('express');
const dbHelpers = require('./helpers/dbHelpers');
const { joinImages } = require('./helpers/imageHelpers');
const twitterOps = require('./helpers/twitterOps');
const { pluck } = require('./utils/utils');
require('./db/mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  return res.send({ message: 'hello' });
});

app.get('/tweets', async (req, res) => {
  const tweets = await twitterOps.getAllMentions();
  const results = await twitterOps.getReferencedTweets(tweets);

  const entries = results.map(result => {
    return {
      id: result.id,
      images: pluck(result.media, 'media_url_https'),
      author: result.author,
    };
  });

  console.log(entries);

  // for (let image of images) {
  //   await joinImages(image.id, image.images);
  // }

  // entries.forEach(async entry => {
  for (let entry of entries) {
    joinImages(entry.id, entry.images)
      .then(() => dbHelpers.getImage(entry.id))
      .then(
        async image =>
          await twitterOps.replyWithPhoto(
            image,
            entry,
            "Hi boss, here's your picture",
          ),
      );
    // console.log(image);
    // res.contentType('image/png');
    // return res.send(image.buffer);
  }
  // });

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
