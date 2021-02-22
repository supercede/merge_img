const mongoose = require('mongoose');
require('dotenv').config();

const { NODE_ENV = 'development', MONGO_DEV_DB, MONGO_PROD_DB, MONGO_PW } = process.env;

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

let db;

if (NODE_ENV === 'development') {
  db = MONGO_DEV_DB;
  // mongoose.set('debug', true);
} else {
  db = MONGO_PROD_DB.replace('<password>', MONGO_PW);
}

const connectWithRetry = () => {
  mongoose
    .connect(db, options)
    .then(() => {
      console.log('MongoDB is connected');
    })
    .catch(err => {
      console.log(err);
      console.log('MongoDB connection unsuccessful, retry after 5 seconds.');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();
