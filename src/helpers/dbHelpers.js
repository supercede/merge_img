const Image = require('../models/image');

module.exports = {
  getImage: async tweetId => {
    const image = await Image.findOne({ tweetId });

    if (!image) {
      return null;
    }
    return Buffer.from(image.photo).toString('base64');
  },
};
