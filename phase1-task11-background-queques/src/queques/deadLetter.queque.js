import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const deadLetterQueue = new Queue('dlq_failed_jobs', {
  connection: redisConnection
});