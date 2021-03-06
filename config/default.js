const moment = require('moment');

module.exports = {
  name: 'core-service',
  env: 'production',
  sendGridApiKey: '',
  port: 8000,
  apiPrefix: '/api/v1',
  sessionSecret: '',
  enableCORS: false,
  requestTimeout: 10000,
  services: {},
  adminEmail: '',
  emailVerificationPath: '',
  resetPasswordPath: '',
  appId: '',
  proxyUrl: '',
  cmsApiKey: '',
  logLevel: 'warn',
  bcryptIterations: 8,
  mongoDB: {
    host: '127.0.0.1',
    user: '',
    password: '',
    database: '',
    port: 27017,
  },
  db: {
    host: '127.0.0.1',
    user: '',
    password: '',
    database: '',
    port: 3306,
    dialect: 'mysql',
    logging: false,
  },
  redis: {
    host: '',
    port: '',
    password: '',
  },
  rabbit: {
    host: '127.0.0.1',
    user: '',
    password: '',
    port: 5672,
    reconnectInterval: 5000,
  },
  jwt: {
    userSecret: '',
    clientSecret: '',
    resetSecret: '',
    verifySecret: '',
    accessTimeout: moment.duration(1, 'hour').asSeconds(),
    resetTimeout: moment.duration(1, 'day').asSeconds(),
    verifyTimeout: moment.duration(1, 'day').asSeconds(),
  },
};
