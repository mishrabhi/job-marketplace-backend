import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';

const PORT = env.PORT || 3009;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Data Privacy Guardrail Node actively managing compliance workflows on Port: ${PORT}`);
});

const triggerSystemTeardown = () => {
  server.close(() => {
    logger.info('Privacy compliance runtime instance contexts severed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', triggerSystemTeardown);
process.on('SIGINT', triggerSystemTeardown);