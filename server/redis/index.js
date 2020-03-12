/**
 * @project core-service
 * @author Kostiantyn Zinevych
 * @version 1.0
 * @since 2019-02-18
 */
// ----------index----------
const redisConfig = require('config').get('redis');
const redis = require('redis');
// const { promisify } = require('util');
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

// module.exports = new Proxy(redisClient, {
//   get(target, prop) {
//     if (prop === 'get') {
//       return promisify(target[prop]);
//     }
//     return target[prop];
//   },
// });
