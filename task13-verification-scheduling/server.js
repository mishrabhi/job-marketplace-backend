import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Verification and Interview Scheduler node driving live over Port: ${PORT}`);
});

const handleTermination = () => {
  server.close(() => {
    logger.info('Operational loops disconnected safely.');
    process.exit(0);
  });
};

process.on('SIGTERM', handleTermination);
process.on('SIGINT', handleTermination);