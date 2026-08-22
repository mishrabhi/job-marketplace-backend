import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
  lazyConnect: false,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Redis disconnected. Retrying connection in ${delay}ms...`);
    return delay;
  }
});

redis.on('connect', () => {
  logger.info(' Connected to Redis memory cache engine');
});

redis.on('error', (err) => {
  logger.error(`Redis runtime connection error: ${err.message}`);
});