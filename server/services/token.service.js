const jwt = require('jsonwebtoken');

class TokenService {
  static generate(payload, secret, options = {}) {
    return new Promise((res, rej) => {
      jwt.sign(payload, secret, options, (err, token) => {
        if (err) return rej(err);
        return res(token);
      });
    });
  }

  static verify(token, secret) {
    return new Promise((res, rej) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) return rej(err);
        return res(decoded);
      });
    });
  }
}

module.exports = TokenService;
