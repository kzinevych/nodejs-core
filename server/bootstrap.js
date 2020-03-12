const config = require('config');

const env = config.get('env');

if (!['production', 'development', 'test'].includes(env)) {
  throw new Error(`Unknown environment - '${env}'.`);
}

global.__DEV__ = env === 'development';
global.__PROD__ = env === 'production';
global.__TEST__ = env === 'test';
