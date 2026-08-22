import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { redis } from './src/config/redis.js';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`API Security & Rate Limiting Service running on Port: ${PORT}`);
});

const executeGracefulShutdown = async () => {
  logger.info('Shutting down server...');
  server.close(async () => {
    await redis.quit();
    logger.info('Redis connection closed. Exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);