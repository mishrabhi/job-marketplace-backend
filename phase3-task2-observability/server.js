import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Distributed Observability & Monitoring Node actively tracking loops on Port: ${PORT}`);
});

const executeCleanExit = () => {
  server.close(() => {
    logger.info('Observability telemetry processing modules severed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeCleanExit);
process.on('SIGINT', executeCleanExit);