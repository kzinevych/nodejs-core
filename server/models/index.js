const config = require('config').get('mongoDB');
const { MongoClient } = require('mongodb');
const { logger } = require('../utils');

const credentials = (config.password) ? `${config.user}:${config.password}` : config.user;
const mongoUrl = `mongodb://${credentials}@${config.host}:${config.port}/${config.database}?authSource=admin`;

class Mongo {
  constructor({ reconnectTime, url }) {
    this.reconnectTime = reconnectTime;
    this.url = url;
    this.db = undefined;
  }

  connectMongo() {
    MongoClient.connect(this.url, (err, db) => {
      if (err) {
        logger.error(`[Mongo] ERROR: ${err.message}`);
        setTimeout(() => this.connectMongo(), this.reconnectTime);
      } else {
        this.db = db;
        logger.info('[Mongo] Connection established successfully!');
      }
    });
  }

  closeMongo() {
    if (this.db) {
      this.db.close();
      this.db = undefined;
      logger.info('[Mongo] Connection closed!');
    }
  }
}

const mongo = new Mongo({ reconnectTime: 1000, url: mongoUrl });
mongo.connectMongo();

module.exports = mongo;
