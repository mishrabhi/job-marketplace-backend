import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`Production Go-Live Gateway active and broadcasting over Port: ${PORT}`);
});

const executeGracefulShutdown = () => {
  server.close(() => {
    logger.info('Production system routing loops closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);