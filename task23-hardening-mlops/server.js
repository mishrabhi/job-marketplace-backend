import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Resilient Traffic Hardened & MLOps Ingestion Server listening over Port: ${PORT}`);
});

const executeGracefulShutdown = () => {
  server.close(() => {
    logger.info('Traffic protection routing runtime threads closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);