const Jimp = require('jimp');

module.exports = {
  joinImages: async (imgArr) => {
    let offsetX1, offsetX2, offsetX3, offsetX4;
    let offsetY1, offsetY2, offsetY3, offsetY4;

    offsetX1 = offsetX2 = offsetX3 = offsetX4 = 10;
    offsetY1 = offsetY2 = offsetY3 = offsetY4 = 10;

    const image = await Jimp.read('images/base/base-img-wt-wt.jpg');
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
        // To-do
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
    }

    const images = [];

    // for (var i = 0; i < imgArr.length; i++) {
    //   images.push((await Jimp.read(imgArr[i])).resize(dim, imgHeight));
    // }

    for (var i = 0; i < imgArr.length; i++) {
      images.push(
        await Jimp.read(imgArr[i]).then((img) => {
          // console.log(img)
          const { width, height: resizeHeight } = img.bitmap;
          return img.resize(
            Math.min(dim, width),
            Math.min(imgHeight, resizeHeight)
          );
        })
      );
    }

    // return;

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

        image.write(`..test/${Date.now()}_waterMark_150x150.png`, function () {
          console.log('wrote the image');
        });
      });
  },

  createImg: () => {
    new Jimp(1000, 1000, '#FFFFFF', (err, image) => {
      if (err) {
        console.log(err);
      }

      image.write('base-img-wt-wt.jpg');
    });
  },
};
