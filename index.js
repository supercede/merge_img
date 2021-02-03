const Jimp = require('jimp');
const express = require('express');
const fs = require('fs');

const app = express();

async function waterMark(waterMarkImage) {
  let collageImg = await Jimp.read('./imgs/aaaaa.jpg');
  collageImg = collageImg.resize(200, 200);
  const image = await Jimp.read('./base-img-wt.jpg');

  collageImg = await collageImg;
  image.composite(collageImg, 10, 10, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacityDest: 0.9,
    opacitySource: 1,
  });
  await image.writeAsync(`test/${Date.now()}_waterMark_150x150.png`);
}

const waterMarkImgArr = async (imgArr) => {
  let offsetX1, offsetX2, offsetX3, offsetX4;
  let offsetY1, offsetY2, offsetY3, offsetY4;

  offsetX1 = offsetX2 = offsetX3 = offsetX4 = 10;
  offsetY1 = offsetY2 = offsetY3 = offsetY4 = 10;

  const image = await Jimp.read('./base-img-wt-wt.jpg');
  const { height } = image.bitmap;
  const dim = height / 2 - 15; // padding

  switch (imgArr.length) {
    case 2:
      offsetX2 = offsetX1 * 2 + dim;
      break;
    case 3:
      offsetX2 = offsetX1 * 2 + dim;
      offsetX3 = offsetX1 + dim / 2;
      console.log(offsetX3);
      offsetY3 = (height + offsetY1) / 2;
      break;
    case 4:
      offsetX2 = offsetX1 * 2 + dim;
      offsetX3 = offsetX1;
      offsetX4 = offsetX2;
      offsetY3 = (height + offsetY1) / 2;
      offsetY4 = offsetY3;
      break;
  }

  const images = [];

  for (var i = 0; i < imgArr.length; i++) {
    images.push((await Jimp.read(imgArr[i])).resize(dim, dim));
  }

  const options = {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacityDest: 1,
    opacitySource: 1,
  };

  Promise.all(images)
    .then(function (data) {
      return Promise.all(images);
    })
    .then(function (data) {
      switch (data.length) {
        case 2:
          image.composite(data[0], offsetX1, offsetY1, options);
          image.composite(data[1], offsetX2, offsetY2, options);
          break;
        case 3:
          image.composite(data[0], offsetX1, offsetY1, options);
          image.composite(data[1], offsetX2, offsetY2, options);
          image.composite(data[2], offsetX3, offsetY3, options);
          break;
        case 4:
          image.composite(data[0], offsetX1, offsetY1, options);
          image.composite(data[1], offsetX2, offsetY2, options);
          image.composite(data[2], offsetX3, offsetY3, options);
          image.composite(data[3], offsetX4, offsetY4, options);
          break;
      }

      image.write(`test/${Date.now()}_waterMark_150x150.png`, function () {
        console.log('wrote the image');
      });
    });
};

const createImg = () => {
  new Jimp(1000, 1000, '#FFFFFF', (err, image) => {
    // this image is 256 x 256, every pixel is set to 0x00000000

    if (err) {
      console.log(err);
    }

    image.write('base-img-wt-wt.jpg');
  });
};

app.get('/', async (req, res) => {
  const folderName = './imgs/';
  const imgs = fs.readdirSync(folderName);
  const fileNames = imgs.map((img) => `${folderName}${img}`);

  // await createImg();
  await waterMarkImgArr(fileNames);
  return res.send({ message: 'hello' });
});

app.listen(5000, () => {
  console.log('app listening on port 5000');
});
