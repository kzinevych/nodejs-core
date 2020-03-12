module.exports = {
  env: 'test',
  envShort: 'test',
  db: {
    logging: false,
  },
  bcryptIterations: 1,
  jwt: {
    userSecret: 'foobar',
    resetSecret: 'foobar',
    verifySecret: 'foobar',
  },
};
