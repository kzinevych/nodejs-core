require('./bootstrap');
const config = require('config');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const flash = require('express-flash');
const helmet = require('helmet');
const timeout = require('connect-timeout');
const cors = require('cors');
const locale = require('locale');
const rabbit = require('./rabbitmq');
const { supportedLocales } = require('./translations');

/**
 *  Middlewares include
 * */

// /**
//  *  Routes
//  * */

const app = express();

/**
 *  Middleware
 * */
app.use(express.static(`${__dirname}public`));
app.use(helmet());
if (!__TEST__) {
  app.use(morgan('dev'));
}
app.use(timeout(120000));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(responseTime());
app.use(flash());
app.use(locale(supportedLocales));

/**
 *  3rd party middleware
 * */
if (config.get('enableCORS')) {
  app.options('*', cors());
  app.use(cors());
}

/**
 * RabbitMQ start worker (consuming messages)
 */
setTimeout(() => {
  rabbit.worker('geo_clients');
  rabbit.worker('geo_drivers');
}, 1000);

/**
 *  Routes include
 * */

/* eslint-disable */
app.use((err, req, res, next) => {
  return res.status(400).json({
    errors: [{
      param: '_error',
      msg: err.message,
    }],
  });
});

/**
 *  Swagger Documentation
 * */

if (__DEV__) {
  /**
     * swagger all documentation
     * */
  app.use('/docs', express.static('swagger'));
}

/**
 *  SErrors handle
 * */
app.use((req, res) => {
  res.status(404);
  res.json({ title: 'Sorry page not found', status: 404 });
});

module.exports = app;
