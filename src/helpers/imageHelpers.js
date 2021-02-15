/* eslint-disable no-new, no-multi-assign  */
const Jimp = require('jimp');
const Image = require('../models/image');
const { mode } = require('../utils/utils');
const { getImage } = require('./dbHelpers');

module.exports = {
  // To break into bits later
  joinImages: async (id, imgArr) => {
    // check db for existing image and return it if it exists
    const checkImg = await getImage(id);
    if (!checkImg) {
      const images = [];
      const orientations = [];

      // Read image URL with JIMP, get properties and note aspect ratio
      imgArr.forEach(photo => {
        images.push(
          Jimp.read(photo).then(img => {
            const { width, height } = img.bitmap;
            const orient = +(width / height).toFixed(2);
            if (orient <= 0.8) {
              orientations.push('portrait');
            } else if (orient > 0.8 && orient <= 1.1) {
              orientations.push('square');
            } else if (orient > 1.1) {
              orientations.push('landscape');
            }
            return img;
          }),
        );
      });

      // resolve images to get orientation (To-Do: find a better way)
      await Promise.all(images);
      let orientation;

      // Squares over portrait or landscape if one of two images is a square
      if (imgArr.length === 2 && orientations.includes('square')) {
        orientation = 'square';
      } else {
        orientation = mode(orientations);
      }

      const imgFile = imgArr.length === 2 ? `base-img-${orientation}.jpg` : `base-img-${orientation}-lg.jpg`;

      const image = await Jimp.read(`images/base/${imgFile}`);

      let offsetX1, offsetX2, offsetX3, offsetX4;
      let offsetY1, offsetY2, offsetY3, offsetY4;

      offsetX1 = offsetX2 = offsetX3 = offsetX4 = 10;
      offsetY1 = offsetY2 = offsetY3 = offsetY4 = 10;

      const { height, width } = image.bitmap;
      const dim = height / 2 - 15; // dimensions inc. padding
      const dimWidth = width / 2 - 15;

      let imgHeight;
      if (imgArr.length === 2) {
        imgHeight = dim * 2;
      } else {
        imgHeight = dim;
      }

      switch (imgArr.length) {
        case 2:
          offsetX2 = offsetX1 * 2 + dimWidth;
          break;
        case 3:
          offsetX2 = offsetX1 * 2 + dimWidth;
          offsetX3 = offsetX1 + dimWidth / 2;
          offsetY3 = (height + offsetY1) / 2;
          break;
        case 4:
          offsetX2 = offsetX1 * 2 + dimWidth;
          offsetX3 = offsetX1;
          offsetX4 = offsetX2;
          offsetY3 = (height + offsetY1) / 2;
          offsetY4 = offsetY3;
          break;
        default:
          break;
      }

      const options = {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacityDest: 1,
        opacitySource: 1,
      };

      // resize images to fit into base image and make a collage
      return Promise.all(images)
        .then(items => items.map(img => img.resize(dimWidth, imgHeight)))
        .then(async data => {
          switch (data.length) {
            case 2: {
              image.composite(data[0], offsetX1, offsetY1, options);
              image.composite(data[1], offsetX2, offsetY2, options);
              break;
            }
            case 3: {
              image.composite(data[0], offsetX1, offsetY1, options);
              image.composite(data[1], offsetX2, offsetY2, options);
              image.composite(data[2], offsetX3, offsetY3, options);
              break;
            }
            case 4: {
              image.composite(data[0], offsetX1, offsetY1, options);
              image.composite(data[1], offsetX2, offsetY2, options);
              image.composite(data[2], offsetX3, offsetY3, options);
              image.composite(data[3], offsetX4, offsetY4, options);
              break;
            }
            default:
              break;
          }

          // Get and return image buffer
          const buf = await image.getBufferAsync(Jimp.AUTO);

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
