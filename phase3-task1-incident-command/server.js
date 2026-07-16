import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`Incident Command operational across port context: ${PORT}`);
});

const cleanShutdown = () => {
  server.close(() => {
    logger.info('Incident tracking channels disconnected smoothly.');
    process.exit(0);
  });
};

process.on('SIGTERM', cleanShutdown);
process.on('SIGINT', cleanShutdown);