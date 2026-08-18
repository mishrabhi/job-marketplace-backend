import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Schema Validation Middleware Service live on Port: ${PORT}`);
});

const executeGracefulShutdown = () => {
  server.close(() => {
    logger.info('Validation engine context closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);