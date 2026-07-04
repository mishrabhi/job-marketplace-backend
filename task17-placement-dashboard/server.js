import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Placement Dashboard Matrix operational over standard port framework: ${PORT}`);
});

const triggerGracefulShutdown = () => {
  server.close(() => {
    logger.info('Dashboard API server thread contextual processing closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', triggerGracefulShutdown);
process.on('SIGINT', triggerGracefulShutdown);