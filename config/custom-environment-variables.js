module.exports = {
  sendGridApiKey: 'SENDGRID_KEY',
  port: 'SERVICE_PORT',
  mongoDB: {
    host: 'MONGO_HOST',
    user: 'MONGO_USER',
    password: 'MONGO_PASSWORD',
    database: 'MONGO_DB',
  },
  redis: {
    host: 'REDIS_HOST',
    password: 'REDIS_PASSWORD',
  },
  rabbit: {
    host: 'RABBIT_HOST',
    user: 'RABBIT_USER',
    password: 'RABBIT_PASSWORD',
  },
  jwt: {
    userSecret: 'USER_ACCESS_SECRET',
    refreshSecret: 'REFRESH_SECRET',
    resetSecret: 'RESET_SECRET',
    publicSecret: 'PUBLIC_SECRET',
    verifySecret: 'VERIFY_SECRET',
  },
};
