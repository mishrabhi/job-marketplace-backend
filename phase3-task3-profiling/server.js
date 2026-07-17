import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Performance Optimization Node actively analyzing queries over Port: ${PORT}`);
});

const executeCleanExit = () => {
  server.close(() => {
    logger.info('Performance profiling server instances dismantled cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeCleanExit);
process.on('SIGINT', executeCleanExit);