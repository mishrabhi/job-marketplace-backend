import app from ('./app');
import env from ('./src/config/env');
import logger from ('./src/config/logger');

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Revenue Dashboard and Payment Stability Engine operating over Port: ${PORT}`);
  logger.info(`🔒 Mode Status indicator: ${env.IS_REAL_MONEY_MODE ? 'REAL_MONEY_PRODUCTION_LIVE' : 'TESTING_SANDBOX_STAGING'}`);
});

const gracefulShutdown = () => {
  logger.info('Termination signal intercepted. Severing connection lines gracefully...');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);