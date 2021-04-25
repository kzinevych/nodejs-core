module.exports = {
  env: 'NODE_ENV',
  sendGridApiKey: 'SENDGRID_KEY',
  port: 'SERVICE_PORT',
  mongoDB: {
    host: 'MONGO_HOST',
    user: 'MONGO_USER',
    password: 'MONGO_PASSWORD',
    database: 'MONGO_DB',
    port: 'DB_PORT',
  },
  db: {
    host: 'DB_HOST',
    database: 'DB_NAME',
    user: 'DB_USER',
    password: 'DB_PASSWORD',
    port: 'DB_PORT',
  },
  redis: {
    host: 'REDIS_HOST',
    password: 'REDIS_PASSWORD',
    port: 'REDIS_PORT',
  },
  rabbit: {
    host: 'RABBIT_HOST',
    user: 'RABBIT_USER',
    password: 'RABBIT_PASSWORD',
    port: 'RABBIT_PORT',
  },
  jwt: {
    userSecret: 'USER_ACCESS_SECRET',
    refreshSecret: 'REFRESH_SECRET',
    resetSecret: 'RESET_SECRET',
    publicSecret: 'PUBLIC_SECRET',
    verifySecret: 'VERIFY_SECRET',
  },
};
