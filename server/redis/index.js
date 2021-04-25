const redisConfig = require('config').get('redis');
const redis = require('redis');
const { logger } = require('../utils');

const redisClient = redis.createClient({
  host: redisConfig.host,
  password: redisConfig.password,
});

redisClient.on('ready', () => {
  logger.info('Redis connection established successfully!');
});

redisClient.on('error', (err) => {
  logger.error(err);
});

module.exports = redisClient;
