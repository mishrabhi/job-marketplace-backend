import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Retention & Lifecycle Notification Engine running on Port: ${PORT}`);
});

const executeGracefulShutdown = () => {
  server.close(() => {
    logger.info('Retention engine context severed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);