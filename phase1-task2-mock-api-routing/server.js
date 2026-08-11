import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Mock Routing API live on Port: ${PORT} [Mock Provider Active: ${env.USE_MOCK_DATA}]`);
});

const executeGracefulShutdown = () => {
  server.close(() => {
    logger.info('Server context dropped cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);