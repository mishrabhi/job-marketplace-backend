import { initEmailWorker } from './src/workers/email.worker.js';
import { logger } from './src/config/logger.js';

logger.info('Starting PlaceMux Background Worker Process...');
const worker = initEmailWorker();

const shutdownWorker = async () => {
  logger.info('Stopping background worker gracefully...');
  await worker.close();
  logger.info('Worker process exited cleanly.');
  process.exit(0);
};

process.on('SIGTERM', shutdownWorker);
process.on('SIGINT', shutdownWorker);