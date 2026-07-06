import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Commits a brand new verified evaluation question block into the active core Item Bank 
 */
export const insertAssessmentItem = async (payload) => {
  logger.info(`Adding new assessment problem question to topic registry segment: ${payload.topic}`);

  const { data: itemRecord, error } = await supabase
    .from('assessment_item_bank')
    .insert([{
      topic: payload.topic,
      difficulty_level: payload.difficulty_level,
      question_payload: payload.question_payload,
      correct_meta: payload.correct_meta,
      created_by: payload.admin_user_id
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return itemRecord;
};

/**
 * Resolves an exam session's flagged status with a permanent administrative verdict 
 */
export const adjudicateProctorSession = async ({ review_id, verdict, admin_user_id, resolution_notes }) => {
  logger.info(`Executing adjudication audit processing rule update on ticket item: ${review_id} to status: ${verdict}`);

  // Fetch target record context from active database line items 
  const { data: reviewTicket, error: fErr } = await supabase
    .from('proctoring_review_queue')
    .select('*')
    .eq('id', review_id)
    .maybeSingle();

  if (fErr) throw appError(500, 'DB_ERROR', fErr.message);
  if (!reviewTicket) throw appError(404, 'REVIEW_TICKET_NOT_FOUND', 'The targeted proctoring record item cannot be found');
  if (reviewTicket.review_status !== 'pending_review') {
    throw appError(400, 'ALREADY_RESOLVED', 'This incident report transaction item has already been adjudicated');
  }

  // Update target entity rows 
  const { data: updatedTicket, error: uErr } = await supabase
    .from('proctoring_review_queue')
    .update({
      review_status: verdict,
      resolved_by: admin_user_id,
      resolution_notes,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', review_id)
    .select()
    .single();

  if (uErr) throw appError(500, 'DB_ERROR', uErr.message);
  return updatedTicket;
};