import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Atomically registers a versioned business event into the transactional outbox[cite: 19]
 */
export const publishToOutbox = async (payload) => {
  const { event_type, schema_version, tenant_id, payload: eventPayload, idempotency_key } = payload;
  logger.info(`Staging outbox event emission for type: ${event_type} under version: ${schema_version}`);

  // Enforce request idempotency[cite: 19]
  const { data: existingEvent } = await supabase
    .from('outbox_events')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingEvent) {
    logger.warn('Duplicate outbox event emission caught. Returning existing transactional row.', { id: existingEvent.id });
    return existingEvent;
  }

  const { data: outboxEntry, error } = await supabase
    .from('outbox_events')
    .insert([{
      event_type,
      schema_version,
      tenant_id,
      payload: eventPayload,
      status: 'pending',
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return outboxEntry;
};

/**
 * Stage C: Dispatches pending events sequentially into the analytics store[cite: 19]
 */
export const processPendingOutboxQueue = async () => {
  logger.info('Running outbox worker worker cycle to deliver pending events...');

  // Fetch pending events ordered strictly by sequence_number[cite: 19]
  const { data: pendingEvents, error: fetchErr } = await supabase
    .from('outbox_events')
    .select('*')
    .eq('status', 'pending')
    .order('sequence_number', { ascending: true })
    .limit(50);

  if (fetchErr) throw appError(500, 'DB_ERROR', fetchErr.message);

  let processedCount = 0;

  for (const event of pendingEvents) {
    // Deliver to downstream analytics store[cite: 19]
    const { error: dispatchErr } = await supabase
      .from('analytics_event_store')
      .insert([{
        outbox_event_id: event.id,
        event_type: event.event_type,
        sequence_number: event.sequence_number,
        tenant_id: event.tenant_id,
        event_payload: event.payload
      }]);

    if (!dispatchErr) {
      await supabase
        .from('outbox_events')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('id', event.id);
      processedCount++;
    } else {
      await supabase
        .from('outbox_events')
        .update({ status: 'failed' })
        .eq('id', event.id);
    }
  }

  return { dispatched_events: processedCount };
};

/**
 * Stage D: Replays events from a given sequence number for historical analytics recovery[cite: 19]
 */
export const replayEventsFromSequence = async (fromSequence) => {
  logger.info(`Replaying outbox event stream starting from sequence offset: ${fromSequence}`);

  const { data: replaySet, error } = await supabase
    .from('outbox_events')
    .select('*')
    .gte('sequence_number', fromSequence)
    .order('sequence_number', { ascending: true });

  if (error) throw appError(500, 'DB_ERROR', error.message);

  return {
    replayed_from_sequence: fromSequence,
    total_events_replayed: replaySet?.length || 0,
    events: replaySet || []
  };
};