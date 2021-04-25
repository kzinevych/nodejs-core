const config = require('config');

const env = config.get('env');

if (!['production', 'development', 'staging'].includes(env)) {
  throw new Error(`Unknown environment - '${env}'.`);
}

global.__DEV__ = env === 'development';
global.__PROD__ = env === 'production';
global.__STAGE__ = env === 'staging';
