const moment = require('moment');
const config = require('config');
const { createLogger, transports } = require('winston');

const sg = require('sendgrid')(config.get('sendGridApiKey'));
const { version } = require('../../package.json');

const logger = createLogger({
  transports: [
    new transports.File({
      filename: 'logs/combined.log',
      level: 'info',
      exitOnError: false,
    }),
    new transports.Console({
      level: config.get('logLevel'),
    }),
  ],
});

exports.logger = logger;

exports.errorLogger = function errorLogger(err, req, responseStatus) {
  const ip = req.headers['x-forwarded-for']
    || req.connection.remoteAddress
    || req.socket.remoteAddress
    || req.connection.socket.remoteAddress;
  ip.replace(/^.*:/, '');

  logger.error({
    xRequestId: req.headers['x-request-id'],
    version,
    origin: req.headers.origin,
    method: req.method,
    host: ('host' in req.headers) ? req.headers.host : 'localhost',
    path: req.originalUrl,
    requestBody: req.body,
    status: (responseStatus) || 500,
    error: err.message ? err.message : err,
    clientIp: ip,
  });
};

exports.responseLogger = function responseLogger(message, req, responseStatus) {
  const ip = req.headers['x-forwarded-for']
    || req.connection.remoteAddress
    || req.socket.remoteAddress
    || req.connection.socket.remoteAddress;
  ip.replace(/^.*:/, '');

  logger.info({
    xRequestId: req.headers['x-request-id'],
    env: config.get('env'),
    version,
    origin: req.headers.origin,
    method: req.method,
    host: req.headers.host,
    path: req.originalUrl,
    requestBody: req.body,
    status: (responseStatus) || 200,
    data: message,
    clientIp: ip,
  });
};

exports.sendEmail = async (fromEmail, toEmail, subject, message) => {
  if (!fromEmail) throw new Error('Please add email to you profile, before contact with support.');

  const request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [
        {
          to: [
            {
              email: toEmail,
            },
          ],
          subject,
        },
      ],
      from: {
        email: fromEmail,
      },
      content: [
        {
          type: 'text/html',
          value: message,
        },
      ],
    },
  });

  let result;
  try {
    const response = await sg.API(request);
    result = { status: response.statusCode, response: response.body };
  } catch (error) {
    result = { status: error.response.statusCode, error: error.response.body.errors[0] };
  }
  return result;
};

exports.isEmpty = function isEmpty(obj) {
  return Object.keys(obj).length === 0;
};

exports.fileTypeToMimeType = (fileExtension) => {
  switch (fileExtension) {
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.doc':
      return 'application/msword';
    case '.pdf':
      return 'application/pdf';
    case '.txt':
      return 'text/plain';
    default:
      throw new Error('Unknown format.');
  }
};

exports.httpMethodToRights = (method) => {
  switch (method) {
    case 'GET':
      return 'read';
    case 'POST':
      return 'create';
    case 'PUT':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      throw new Error('Unknown method.');
  }
};

exports.httpRightsToMethod = (right) => {
  switch (right) {
    case 'read':
      return 'GET';
    case 'create':
      return 'POST';
    case 'update':
      return 'PUT';
    case 'delete':
      return 'DELETE';
    default:
      throw new Error('Unknown rights.');
  }
};

exports.millisecondsToExpire = (currentYear, currentMonth, currentDay, hours, minutes, seconds, milliseconds) => {
  const currentTime = moment().format('x');
  const expirationDate = moment({
    y: currentYear, M: currentMonth, d: currentDay, h: hours, m: minutes, s: seconds, ms: milliseconds,
  }).format('x');
  return +(((expirationDate - currentTime) / 1000).toFixed(0));
};

exports.listEmailToArray = (list) => {
  if (list) {
    const toArray = list.split(',');
    const emailsList = [];
    toArray.map(email => emailsList.push({ email }));
    return emailsList;
  }
  return [{ email: '' }];
};
