// file to manage the actual connections to the persist data store

const storage = require('node-persist');

const db = storage.create({ dir: './node-persist/data' });

// async () => await db.init();

const init = async () => db.init();

init();

module.exports = db;
