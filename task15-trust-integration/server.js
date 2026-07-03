import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Trust Layer Integration node active over standard execution port: ${PORT}`);
});

const cleanSystemShutdown = () => {
  server.close(() => {
    logger.info('Task 15 integration runtime instances cleared safely.');
    process.exit(0);
  });
};

process.on('SIGTERM', cleanSystemShutdown);
process.on('SIGINT', cleanSystemShutdown);