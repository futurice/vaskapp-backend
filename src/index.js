// App is separated to its own module so that it is easier to run in tests
// too
import createApp from './app';
import enableDestroy from 'server-destroy';
import BPromise from 'bluebird';
const logger = require('./util/logger')(__filename);
require('./init-env-variables');

BPromise.config({
  warnings: process.env.NODE_ENV !== 'production',
  longStackTraces: true
});

const app = createApp();
let server = app.listen(process.env.PORT, () => {
  logger.info(
    'Express server listening on port %d in %s mode',
    process.env.PORT,
    app.get('env')
  );
});
enableDestroy(server);

function _closeServer(signal) {
  logger.info(signal + ' received');
  logger.info('Closing http.Server ..');
  server.destroy();
}

// Handle signals gracefully. Heroku will send SIGTERM before idle.
process.on('SIGTERM', _closeServer.bind(this, 'SIGTERM'));
process.on('SIGINT', _closeServer.bind(this, 'SIGINT(Ctrl-C)'));

server.on('close', () => {
  logger.info('Server closed');
  process.emit('cleanup');

  logger.info('Giving 100ms time to cleanup..');
  // Give a small time frame to clean up
  setTimeout(process.exit, 100);
});
