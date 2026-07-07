import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Ingestion Roster Processing Server actively driving loops on Port: ${PORT}`);
});

const triggerSystemExit = () => {
  server.close(() => {
    logger.info('Bulk operational processor framework cleared.');
    process.exit(0);
  });
};

process.on('SIGTERM', triggerSystemExit);
process.on('SIGINT', triggerSystemExit);