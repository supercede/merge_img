const isTweetAReply = tweet => !!tweet.in_reply_to_status_id_str;

const isTweetAReplyToMe = tweet =>
  tweet.in_reply_to_screen_name === process.env.TWITTER_SCREEN_NAME;

const filterTweetImages = tweet => !!tweet.extended_entities && !!tweet.extended_entities.media;

const doesTweetHaveAtLeastTwoPhotos = tweet =>
  tweet.media.filter(media => media.type === 'photo').length > 1;

module.exports = {
  isTweetAReply,
  isTweetAReplyToMe,
  filterTweetImages,
  doesTweetHaveAtLeastTwoPhotos,
};
