const Image = require('../models/image');

module.exports = {
  getImage: async tweetId => {
    const image = await Image.findOne({ tweetId });

    if (!image) {
      throw new Error('Image not found');
    }
    return Buffer.from(image.photo).toString('base64');
  },
};
