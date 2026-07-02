import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Unified Application Tracking Node broadcasting live over Port: ${PORT}`);
});

const executeGracefulTeardown = () => {
  server.close(() => {
    logger.info('Tracking thread execution contexts severed safely.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulTeardown);
process.on('SIGINT', executeGracefulTeardown);