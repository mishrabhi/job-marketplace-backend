import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`Reliability Sign-off & Concurrency Suite online on Port: ${PORT}`);
});

const executeGracefulShutdown = () => {
  server.close(() => {
    logger.info('Reliability test framework contexts disconnected cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);