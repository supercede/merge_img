const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

const imageSchema = new mongoose.Schema({
  tweetId: {
    type: String,
    required: 'true',
  },
  photo: {
    type: Buffer,
    required: 'true',
  },
});

imageSchema.plugin(findOrCreate);
const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
