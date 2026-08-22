import app from './app.js';
import { env } from './src/config/env.js';
import { logger } from './src/config/logger.js';
import { pool } from './src/config/db.js';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Throughput Server live on Port: ${PORT} (PID: ${process.pid})`);
});

const executeGracefulShutdown = async () => {
  logger.info(`Shutting down worker PID ${process.pid}...`);
  server.close(async () => {
    await pool.end();
    logger.info(`DB pool drained for PID ${process.pid}. Exiting.`);
    process.exit(0);
  });
};

process.on('SIGTERM', executeGracefulShutdown);
process.on('SIGINT', executeGracefulShutdown);