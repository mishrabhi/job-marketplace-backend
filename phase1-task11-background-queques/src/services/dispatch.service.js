import { emailQueue } from '../queues/email.queue.js';
import { deadLetterQueue } from '../queues/deadLetter.queue.js';
import { logger } from '../config/logger.js';

export const enqueueEmailDispatch = async (payload) => {
  logger.info(`Enqueuing background job for: ${payload.recipient} with key ${payload.idempotency_key}`);

  // Enqueue job with custom job ID matching idempotency key[cite: 16]
  const job = await emailQueue.add('send_notification_email', payload, {
    jobId: payload.idempotency_key
  });

  return {
    job_id: job.id,
    queue_name: emailQueue.name,
    status: 'QUEUED',
    enqueued_at: new Date().toISOString()
  };
};

export const getQueueMetrics = async () => {
  const [waiting, active, completed, failed, dlqCount] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    deadLetterQueue.getWaitingCount()
  ]);

  return {
    email_queue: { waiting, active, completed, failed },
    dead_letter_queue: { total_exhausted_jobs: dlqCount }
  };
};