import supabase from ('../config/db');
import logger from ('../config/logger');
import webhookService from ('./webhook');
import logPaymentFailure from ('./failureHandling.service');

export default enqueueWebhook = async (eventType, payload, rawSignature) => {
  const { data, error } = await supabase
    .from('webhook_retry_queue')
    .insert([{
      event_type: eventType,
      payload,
      raw_signature: rawSignature,
      status: 'pending',
      attempt_count: 0,
      next_retry_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  logger.warn('Webhook enqueued for retry', { event_type: eventType });
  return data;
};

export default processRetryQueue = async () => {
  const { data: rows, error } = await supabase
    .from('webhook_retry_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('next_retry_at', new Date().toISOString())
    .order('next_retry_at', { ascending: true })
    .limit(10);

  if (error) {
    logger.error('Error selecting records from webhook retry queue', { error: error.message });
    return { processed: 0, succeeded: 0, failed: 0, dead: 0 };
  }

  const results = { processed: rows.length, succeeded: 0, failed: 0, dead: 0 };

  for (const row of rows) {
    const nextAttempt = row.attempt_count + 1;

    const { error: lockError } = await supabase
      .from('webhook_retry_queue')
      .update({ status: 'processing', attempt_count: nextAttempt })
      .eq('id', row.id)
      .eq('status', 'pending');

    if (lockError) continue; 

    try {
      const bufferPayload = Buffer.from(JSON.stringify(row.payload));
      await webhookService.handleWebhookEvent(bufferPayload, row.raw_signature, true);

      await supabase
        .from('webhook_retry_queue')
        .update({ status: 'succeeded' })
        .eq('id', row.id);

      logger.info('Webhook retry succeeded', { id: row.id, event_type: row.event_type, attempt_count: nextAttempt });
      results.succeeded++;
    } catch (err) {
      if (nextAttempt >= row.max_attempts) {
        await supabase.from('webhook_retry_queue').update({ status: 'dead', last_error: err.message }).eq('id', row.id);

        await supabase.from('webhook_dlq').insert([{
          retry_queue_id: row.id,
          event_type: row.event_type,
          payload: row.payload,
          total_attempts: nextAttempt,
          last_error: err.message
        }]);

        logger.error('Webhook moved to DLQ', { id: row.id, event_type: row.event_type, attempt_count: nextAttempt, error: err.message });
        
        await logPaymentFailure(
          null,
          'WEBHOOK_PROCESSING_ERROR',
          'MAX_RETRIES_EXCEEDED',
          err.message,
          { retry_queue_id: row.id, event_type: row.event_type }
        );

        results.dead++;
      } else {
        const delaySeconds = Math.min(30 * Math.pow(2, nextAttempt), 3600);
        const nextRetryAt = new Date(Date.now() + delaySeconds * 1000).toISOString();

        await supabase
          .from('webhook_retry_queue')
          .update({
            status: 'pending',
            next_retry_at: nextRetryAt,
            last_error: err.message
          })
          .eq('id', row.id);

        results.failed++;
      }
    }
  }

  return results;
};

export default getDLQEntries = async ({ page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('webhook_dlq')
    .select('*', { count: 'exact' })
    .order('moved_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    data: data || [],
    meta: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit)
    }
  };
};

