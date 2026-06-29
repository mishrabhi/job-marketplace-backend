import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Security Validation Core initialized live over Port: ${PORT}`);
});

const forceCleanExit = () => {
  server.close(() => {
    logger.info('Clean termination accomplished successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', forceCleanExit);
process.on('SIGINT', forceCleanExit);