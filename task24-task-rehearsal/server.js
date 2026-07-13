import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Launch Rehearsal & Policy Enforcement Node broadcast active on Port: ${PORT}`);
});

const executeCleanExit = () => {
  server.close(() => {
    logger.info('Launch validation operational loops closed down safely.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeCleanExit);
process.on('SIGINT', executeGracefulShutdown);

function executeGracefulShutdown() {
  executeCleanExit();
}