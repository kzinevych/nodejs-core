const config = require('config').get('mongoDB');

const credentials = (config.password) ? `${config.username}:${config.password}` : config.username;
const options = {
  url: `mongodb://${credentials}@${config.host}:${config.port}/${config.database}?authSource=admin`,
};

module.exports = {
  development: options,
  test: options,
  staging: options,
  production: options,
};
