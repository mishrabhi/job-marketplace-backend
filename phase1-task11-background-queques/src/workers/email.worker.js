import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { deadLetterQueue } from '../queues/deadLetter.queue.js';
import { logger } from '../config/logger.js';

// In-memory idempotency execution ledger
const processedJobLedger = new Set();

export const initEmailWorker = () => {
  const worker = new Worker(
    'email_dispatch_queue',
    async (job) => {
      const { idempotency_key, recipient, subject, should_fail } = job.data;

      logger.info(`[Worker] Processing Job ${job.id} (Attempt ${job.attemptsMade + 1}) for ${recipient}`);

      // 1. Idempotency Check: Prevent duplicate effects on retries
      if (processedJobLedger.has(idempotency_key)) {
        logger.warn(`[Worker] Job with idempotency key '${idempotency_key}' was already executed. Skipping redundant processing.`);
        return { status: 'SKIPPED_DUPLICATE', idempotency_key };
      }

      // 2. Simulated failure path to demonstrate retries and DLQ
      if (should_fail) {
        throw new Error(`Simulated dispatch failure: Upstream SMTP provider timeout for ${recipient}`);
      }

      // 3. Simulated heavy background task (e.g. PDF generation + email send)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mark as processed
      processedJobLedger.add(idempotency_key);

      logger.info(`[Worker] Job ${job.id} completed successfully!`);
      return { status: 'SENT', recipient, delivered_at: new Date().toISOString() };
    },
    {
      connection: redisConnection,
      concurrency: 5
    }
  );

  // Failure event: Route to Dead-Letter Queue if retries are exhausted
  worker.on('failed', async (job, err) => {
    logger.error(`[Worker] Job ${job.id} failed on attempt ${job.attemptsMade}: ${err.message}`);

    if (job.attemptsMade >= job.opts.attempts) {
      logger.error(`[Worker] Job ${job.id} exhausted all ${job.opts.attempts} attempts. Moving to Dead-Letter Queue!`);
      await deadLetterQueue.add('dead_letter_job', {
        original_job_id: job.id,
        queue_name: job.queueName,
        data: job.data,
        failed_reason: err.message,
        exhausted_at: new Date().toISOString()
      });
    }
  });

  worker.on('error', (err) => {
    logger.error(`[Worker Error] ${err.message}`);
  });

  return worker;
};