const { validationResult } = require('express-validator/check');
const { errorLogger } = require('../utils');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const resultErrors = errors.array().map(item => ({
      param: item.param,
      msg: item.msg,
    }));

    errorLogger(resultErrors, req, 422);
    return res.status(422).json({ errors: resultErrors });
  }
  return next();
};
