import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Central Admin Console Engine actively conducting operations over Port: ${PORT}`);
});

const triggerGracefulTeardown = () => {
  server.close(() => {
    logger.info('Administrative routing operations closed out cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', triggerGracefulTeardown);
process.on('SIGINT', triggerGracefulTeardown);