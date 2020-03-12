/**
 * Module dependencies.
 */
const config = require('config');
const http = require('http');
const { logger } = require('../utils');
const app = require('../app');
/**
 * Get port from environment and store in Express.
 */


app.set('port', config.get('port'));
/**
 * Create HTTP server.
 */
const server = http.createServer(app);

server.listen(config.get('port'), () => {
  console.log(`Payment service started on http://localhost:${config.get('port')}/docs`);
});
server.on('error', onError);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  console.log('onError: ', error);

  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`${config.get('port')} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${config.get('port')} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}
