const config = require('config');
const jwtConfig = require('config').get('jwt');
const redisClient = require('../redis');
const TokenService = require('../services/token.service');

// Utils
const { logger, errorLogger, httpMethodToRights } = require('../utils');

const checkAnyToken = (role, secret) => async (req, res, next) => {
  const token = (req.headers.authorization) ? req.headers.authorization.replace('Token ', '') : null;
  try {
    const user = await TokenService.verify(token, secret);

    if (!user) {
      errorLogger(`${role} is inactive.`, req, 401);
      throw new Error(`${role} is inactive.`);
    }

    await new Promise((resolve, reject) => {
      // eslint-disable-next-line consistent-return
      redisClient.get(token, (err, reply) => {
        if (reply === 'expired') {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('jwt expired');
        } else {
          resolve();
        }
      });
    });
    req[role.toLowerCase()] = user;
    return next();
  } catch (err) {
    errorLogger(err, req, 401);
    return res.status(401).json({
      error: [
        {
          param: '_error',
          msg: err,
        },
      ],
    });
  }
};
exports.checkToken = checkAnyToken('User', jwtConfig.userSecret);
exports.checkClientToken = checkAnyToken('Client', jwtConfig.clientSecret);
exports.checkDriverToken = checkAnyToken('Driver', jwtConfig.driverSecret);

const getTokenMiddleware = (headerName, jwtSecret) => async (req, res, next) => {
  const token = (req.headers[headerName]) ? req.headers[headerName].replace('Token ', '') : null;
  try {
    const decodedData = await TokenService.verify(token, jwtSecret);
    logger.info({ jwtResetDecoded: decodedData });
    req.client = decodedData;
    next();
  } catch (err) {
    next(err);
  }
};
exports.checkRefreshToken = getTokenMiddleware('refreshtoken', jwtConfig.refreshSecret);

exports.checkRole = async function checkRole(req, res, next) {
  const { role: { scope, status } } = req.user;
  const baseUrl = (req.body.baseUrl) ? req.body.baseUrl : req.baseUrl;

  const baseRoute = baseUrl.replace(`${config.get('apiPrefix')}/`, '');
  const method = (req.body.method) ? req.body.method : req.method;
  const roleName = `${httpMethodToRights(method)}:${baseRoute}`;
  const roleRegExp = new RegExp(roleName);

  if ((!roleRegExp.test(scope) && (scope !== '*')) || (status !== 'active')) {
    errorLogger("You don't have permissions!", req, 403);
    return res.status(403).json({
      error: [
        {
          param: '_error',
          msg: "You don't have permissions!",
        },
      ],
    });
  }

  return next();
};
