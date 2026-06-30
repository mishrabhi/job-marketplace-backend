import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Books interview sessions with deduplication safeguards [cite: 374, 391]
 */
export const executeInterviewBooking = async (payload) => {
  logger.info('Executing interview booking sequence operation', { key: payload.idempotency_key });

  // 1. Check for duplicate requests using the idempotency key [cite: 391]
  const { data: existingSlot, error: idenErr } = await supabase
    .from('interview_slots')
    .select('*')
    .eq('idempotency_key', payload.idempotency_key)
    .maybeSingle();

  if (idenErr) throw appError(500, 'DB_ERROR', idenErr.message);
  if (existingSlot) {
    logger.warn('Returning cached database record for duplicate transactional intent', { id: existingSlot.id });
    return existingSlot;
  }

  // 2. Persist real-data session record into database 
  const { data: bookedSlot, error: insErr } = await supabase
    .from('interview_slots')
    .insert([{
      application_id: payload.application_id,
      interviewer_id: payload.interviewer_id,
      student_id: payload.student_id,
      scheduled_start: payload.scheduled_start,
      scheduled_end: payload.scheduled_end,
      meeting_link: payload.meeting_link || null,
      idempotency_key: payload.idempotency_key,
      status: 'scheduled'
    }])
    .select()
    .single();

  if (insErr) throw appError(500, 'DB_ERROR', insErr.message);
  return bookedSlot;
};