import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { pool } from './src/config/db.js';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Persistence Layer Service live on Port: ${PORT}`);
});

const executeGracefulShutdown = async () => {
  logger.info('Shutting down server and releasing DB pool connections...');
  server.close(async () => {
    await pool.end();
    logger.info('Database pool drained successfully. Process exiting.');
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);