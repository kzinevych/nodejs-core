const config = require('config');
const amqp = require('amqplib/callback_api');
const { logger } = require('../utils');
const mongo = require('../models');

class Amqp {
  constructor(reconnectTime) {
    this.reconnectTime = reconnectTime;
    this.amqpConnection = undefined;
    this.publisherChannel = undefined;
    this.consumerChannel = undefined;
  }

  connectAmqp() {
    const {
      host,
      port,
      user,
      password,
    } = config.get('rabbit');
    const url = `amqp://${user}:${password}@${host}:${port}`;
    amqp.connect(`${url}?heartbeat=60`, (err, conn) => {
      if (err) {
        logger.error(`[AMQP] ${err.message}`);
        setTimeout(() => this.connectAmqp(), this.reconnectTime);
      } else {
        conn.on('error', (_err) => {
          if (_err.message !== 'Connection closing') logger.error(`[AMQP] connection error: ${_err.message}`);
        });

        conn.on('close', () => {
          logger.error('[AMQP] reconnecting...');
          return setTimeout(() => this.connectAmqp(), this.reconnectTime);
        });

        this.amqpConnection = conn;
        logger.info('[AMQP] connected.');

        this.preparePublishedChannel();
        this.prepareConsumerChannel();
      }
    });
  }

  preparePublishedChannel() {
    if (this.amqpConnection) {
      this.amqpConnection.createConfirmChannel((err, ch) => {
        if (this.closeOnErr(err)) return;

        ch.on('error', (_err) => {
          logger.error(`[AMQP] channel error: ${_err.message}`);
        });
        ch.on('close', () => {
          logger.info('[AMQP] channel closed.');
        });

        this.publisherChannel = ch;
        logger.info('[AMQP] publisher channel prepared.');
      });
    } else {
      logger.error('[AMQP] connection is not established.');
    }
  }

  prepareConsumerChannel() {
    if (this.amqpConnection) {
      this.amqpConnection.createConfirmChannel((err, ch) => {
        if (this.closeOnErr(err)) return;

        ch.on('error', (_err) => {
          logger.error(`[AMQP] channel error: ${_err.message}`);
        });
        ch.on('close', () => {
          logger.info('[AMQP] channel closed.');
        });

        this.consumerChannel = ch;
        logger.info('[AMQP] consumer channel prepared.');
      });
    } else {
      logger.error('[AMQP] connection is not established.');
    }
  }

  publish(exchangeName, key, message) {
    if (this.amqpConnection) {
      if (this.publisherChannel) {
        const ch = this.publisherChannel;
        ch.prefetch(1);

        logger.info(`[AMQP] exchange: ${exchangeName} | message: ${JSON.stringify(message)}.`);
        ch.publish(exchangeName, key, Buffer.from(JSON.stringify(message)), { persistent: true });
      }
    } else {
      logger.error('[AMQP] connection is not established.');
    }
  }

  worker(queueName) {
    return new Promise(() => {
      if (this.amqpConnection) {
        if (this.publisherChannel) {
          const ch = this.consumerChannel;
          ch.assertQueue(queueName, {}, (_err, q) => {
            ch.consume(q.queue, async (msg) => {
              logger.info({
                route: msg.fields.routingKey,
                msg: msg.content.toString(),
              });
              const {
                id,
                role,
                orderId,
                coordinates,
                date,
              } = JSON.parse(msg.content.toString());

              if (role === 'client') {
                mongo.db.collection('clientsCoordinates', async (error, collection) => {
                  const geoResult = await collection.findOne({ orderId });
                  if (!geoResult) {
                    const geoData = {
                      clientId: id,
                      orderId,
                      coordinates,
                      date: new Date(date),
                    };
                    await collection.insert(geoData);
                    logger.info(`client geo coordinates saved: ${JSON.stringify(geoData)}`);
                  }
                });
              }

              if (role === 'driver') {
                mongo.db.collection('driversCoordinates', async (error, collection) => {
                  const geoResult = await collection.findOne({ orderId });

                  if (!geoResult) {
                    const geoData = {
                      driverId: id,
                      orderId,
                      coordinates,
                      date: new Date(date),
                    };
                    await collection.insert(geoData);
                    logger.info(`driver geo coordinates saved: ${JSON.stringify(geoData)}`);
                  }
                });
              }
            }, { noAck: true });
          });
        }
      } else {
        logger.error('[AMQP] connection is not established.');
      }
    });
  }

  closeOnErr(err) {
    if (!err) return false;
    logger.error(`[AMQP] error: ${err}`);
    this.amqpConnection.close();
    return true;
  }
}

const rabbit = new Amqp(1000);
rabbit.connectAmqp();

module.exports = rabbit;
