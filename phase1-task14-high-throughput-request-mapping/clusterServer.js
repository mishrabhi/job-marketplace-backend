import cluster from 'cluster';
import os from 'os';
import { logger } from './src/config/logger.js';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  logger.info(`👑 Master Cluster Manager (PID: ${process.pid}) initializing across ${numCPUs} CPU cores...`);

  // Fork worker process for every CPU core[cite: 15]
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('online', (worker) => {
    logger.info(` Worker process ${worker.process.pid} is online and accepting traffic`);
  });

  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`⚠️ Worker process ${worker.process.pid} died (Code: ${code}, Signal: ${signal}). Spawning replacement...`);
    cluster.fork(); // Self-healing worker replacement[cite: 15]
  });
} else {
  // Worker process loads application server[cite: 15]
  import('./server.js');
}