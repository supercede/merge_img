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

  const entries = results.map(result => ({
    id: result.id,
    images: pluck(result.media, 'media_url_https'),
    author: result.author,
    mention_id: result.mention_id,
    mention_author: result.mention_author,
  }));

  console.log(entries.length);

  // console.log(entries);

  // for (let image of images) {
  //   await joinImages(image.id, image.images);
  // }

  // entries.forEach(async entry => {
  for (let entry of entries) {
    console.log(entry);
    await joinImages(entry.mention_id, entry.images)
      // .then(async () => await dbHelpers.getImage(entry.mention_id))
      .then(async image => {
        console.log(image);
        if (image) {
          await twitterOps.replyWithPhoto(
            image,
            entry,
            "Hi boss, here's your picture",
          );
        }
      });
    // console.log(image);
  }
  // });

  return res.send('OK');

  // await joinImages(imgURLs[0]);

  return res.status(200).json({
    tweets,
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
