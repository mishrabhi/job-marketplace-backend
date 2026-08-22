import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: 3
});

redis.on('connect', () => {
  logger.info(' Connected to Redis distributed rate-limiting store');
});

redis.on('error', (err) => {
  logger.error(`Redis connection failure: ${err.message}`);
});