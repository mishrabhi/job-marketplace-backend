import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Unified Cross-Portal Orchestration verification node live over Port: ${PORT}`);
});

const executeCleanExit = () => {
  server.close(() => {
    logger.info('Contextual multi-role portal integration execution thread loops terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeCleanExit);
process.on('SIGINT', executeCleanExit);