const config = require('config');
const amqp = require('amqplib/callback_api');
const { logger } = require('../utils');

const {
  host,
  port,
  user,
  password,
  reconnectInterval,
} = config.get('rabbit');

class Amqp {
  constructor(reconnectTime) {
    this.reconnectTime = reconnectTime;
    this.amqpConnection = undefined;
    this.publisherChannel = undefined;
    this.consumerChannel = undefined;
  }

  connectAmqp() {
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

  publish(exchangeName, key, message, req) {
    if (this.amqpConnection) {
      if (this.publisherChannel) {
        const ch = this.publisherChannel;
        ch.prefetch(1);

        const updatedMessage = Object.assign({}, message);
        if (req) {
          const ip = req.headers['x-forwarded-for']
            || req.connection.remoteAddress
            || req.socket.remoteAddress
            || req.connection.socket.remoteAddress;
          ip.replace(/^.*:/, '');
          updatedMessage.req = {};
          updatedMessage.req.xRequestId = req.headers['x-request-id'];
          updatedMessage.req.statusCode = 200;
          updatedMessage.req.origin = req.headers.origin;
          updatedMessage.req.method = req.method;
          updatedMessage.req.host = req.headers.host;
          updatedMessage.req.originalUrl = req.originalUrl;
          updatedMessage.req.requestBody = req.body;
          updatedMessage.req.ip = ip;
        }

        logger.info({ message: `[AMQP] exchange: ${exchangeName}`, data: message });
        ch.publish(exchangeName, key, Buffer.from(JSON.stringify(updatedMessage)), { persistent: true });
      }
    } else {
      logger.error('[AMQP] connection is not established.');
    }
  }

  worker(exchangeName, cb) {
    if (this.amqpConnection) {
      if (this.publisherChannel) {
        const ch = this.consumerChannel;
        ch.assertQueue(exchangeName, {}, (_err, q) => {
          ch.consume(q.queue, (msg) => {
            let content;
            try {
              content = JSON.parse(msg.content.toString());
            } catch (err) {
              logger.error(`ERROR parse in Consumed data message: ${err.message}`);
            }
            logger.info({ routingKey: msg.fields.routingKey, msg: content });
            cb({
              route: msg.fields.routingKey,
              msg: msg.content.toString(),
            });
          }, { noAck: true });
        });
      }
    } else {
      logger.error('[AMQP] connection is not established.');
    }
  }

  closeOnErr(err) {
    if (!err) return false;
    logger.error(`[AMQP] error: ${err}`);
    this.amqpConnection.close();
    return true;
  }
}

const rabbit = new Amqp(reconnectInterval);
rabbit.connectAmqp();

module.exports = rabbit;
