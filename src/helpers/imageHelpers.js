const Jimp = require('jimp');
const Image = require('../models/image');
const { getImage } = require('./dbHelpers');

/* eslint-disable no-new, no-multi-assign */

module.exports = {
  joinImages: async (id, imgArr) => {
    const checkImg = await getImage(id);
    if (!checkImg) {
      let offsetX1, offsetX2, offsetX3, offsetX4;
      let offsetY1, offsetY2, offsetY3, offsetY4;

      offsetX1 = offsetX2 = offsetX3 = offsetX4 = 10;
      offsetY1 = offsetY2 = offsetY3 = offsetY4 = 10;

      const imgFile = imgArr.length === 2 ? 'base-img-wt.jpg' : 'base-img-wt-wt.jpg';

      const image = await Jimp.read(`images/base/${imgFile}`);

      const { height } = image.bitmap;
      const dim = height / 2 - 15; // dimensions inc. padding

      let imgHeight;
      if (imgArr.length === 2) {
        imgHeight = dim * 2;
      } else {
        imgHeight = dim;
      }

      switch (imgArr.length) {
        case 2:
          // to do?
          offsetX2 = offsetX1 * 2 + dim;
          break;
        case 3:
          offsetX2 = offsetX1 * 2 + dim;
          offsetX3 = offsetX1 + dim / 2;
          offsetY3 = (height + offsetY1) / 2;
          break;
        case 4:
          offsetX2 = offsetX1 * 2 + dim;
          offsetX3 = offsetX1;
          offsetX4 = offsetX2;
          offsetY3 = (height + offsetY1) / 2;
          offsetY4 = offsetY3;
          break;
        default:
          break;
      }

      const images = [];
      for (let i = 0; i < imgArr.length; i++) {
        images.push(
          Jimp.read(imgArr[i]).then(img => {
            // console.log(img)
            const { width, height: resizeHeight } = img.bitmap;
            return img.resize(Math.min(dim, width), Math.min(imgHeight, resizeHeight));
          }),
        );
      }

      const options = {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest: 1,
        opacitySource: 1,
      };

      return Promise.all(images)
        .then(data => Promise.all(images))
        .then(async data => {
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
            default:
              break;
          }

          const buf = await image.getBufferAsync(Jimp.AUTO);
          await image.write(`../../test/${Date.now()}.jpg`, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log('a ti ko');
            }
          });
          await Image.findOrCreate(
            { tweetId: id },
            {
              tweetId: id,
              photo: buf,
            },
          );

          return Buffer.from(buf).toString('base64');
        });
    }
    return checkImg;
  },
};
