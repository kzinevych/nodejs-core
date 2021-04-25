const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const dbConfig = require('config').get('db');
const { logger } = require('../utils');

const basename = path.basename(__filename);
const db = {};

const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  logging: dbConfig.logging,
  define: dbConfig.define,
});

sequelize.authenticate().then(() => {
  logger.info('connected to MySQL');
});

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
