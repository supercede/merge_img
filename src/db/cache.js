const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

client.on('connect', () => {
  console.log('connected to redis server');
});

const getAsync = promisify(client.get).bind(client);

exports.getAsync = getAsync;
exports.client = client;
