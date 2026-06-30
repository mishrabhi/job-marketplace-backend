import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Cryptographic Document Sealing Node active on Port: ${PORT}`);
});

const handleTermination = () => {
  server.close(() => {
    logger.info('Server contextual run loops dropped safely.');
    process.exit(0);
  });
};

process.on('SIGTERM', handleTermination);
process.on('SIGINT', handleTermination);