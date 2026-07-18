import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Backpressure Control Hub actively auditing traffic workloads over Port: ${PORT}`);
});

const executeCleanExit = () => {
  server.close(() => {
    logger.info('Traffic degradation processing server endpoints dropped gracefully.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeCleanExit);
process.on('SIGINT', executeCleanExit);