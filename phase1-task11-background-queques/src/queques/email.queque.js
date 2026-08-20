import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { env } from '../config/env.js';

export const emailQueue = new Queue('email_dispatch_queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: env.QUEUE_MAX_ATTEMPTS,
    backoff: {
      type: 'exponential',
      delay: env.QUEUE_BACKOFF_DELAY_MS
    },
    removeOnComplete: {
      age: 3600, // keep 1 hour
      count: 1000
    },
    removeOnFail: false // Retain for dead-lettering
  }
});