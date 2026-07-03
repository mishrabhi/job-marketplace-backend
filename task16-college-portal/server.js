import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 College Reporting Base Foundation actively executing over Port: ${PORT}`);
});

const triggerSystemExit = () => {
  server.close(() => {
    logger.info('Portal context instance threads dismantled gracefully.');
    process.exit(0);
  });
};

process.on('SIGTERM', triggerSystemExit);
process.on('SIGINT', triggerSystemExit);