import app from ('./app');
import env from ('./src/config/env');
import logger from ('./src/config/logger');
import webhookRetryService from ('./src/services/webhookRetry.service');

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Resilient Server run loop started successfully over port: ${PORT}`);
});

const retryInterval = setInterval(async () => {
  try {
    const result = await webhookRetryService.processRetryQueue();
    if (result.processed > 0) {
      logger.info('Webhook retry worker ran structural pass execution loop', result);
    }
  } catch (err) {
    logger.error('Webhook retry worker crashed unprompted inside run lifecycle', { error: err.message });
  }
}, 60000);

const gracefulShutdown = () => {
  logger.info('Received termination signal. Executing termination procedures...');
  clearInterval(retryInterval);
  server.close(() => {
    logger.info('Server connection loops decoupled cleanly. System exit completed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);