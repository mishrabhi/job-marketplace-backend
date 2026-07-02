import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Updates application state and records the transition for tracking auditability [cite: 491, 560]
 */
export const advanceApplicationStatus = async ({ application_id, new_status, changed_by, reason_note }) => {
  logger.info(`Initiating status mutation cycle to state: ${new_status} for application: ${application_id}`);

  // 1. Fetch current status details from active database records [cite: 517]
  const { data: application, error: fetchErr } = await supabase
    .from('applications')
    .select('id, status')
    .eq('id', application_id)
    .maybeSingle();

  if (fetchErr) throw appError(500, 'DB_ERROR', fetchErr.message);
  if (!application) throw appError(404, 'APPLICATION_NOT_FOUND', 'Target application file missing');
  if (application.status === new_status) {
    return { current_status: application.status, message: "Target state already mirrors desired endpoint values" };
  }

  const previousStatus = application.status;

  // 2. Perform the update mutation directly on the application row [cite: 517]
  const { error: updateErr } = await supabase
    .from('applications')
    .update({ status: new_status, updated_at: new Date().toISOString() })
    .eq('id', application_id);

  if (updateErr) throw appError(500, 'DB_ERROR', updateErr.message);

  // 3. Log the history transition event for analytics and auditing purposes 
  const { data: logRecord, error: logErr } = await supabase
    .from('application_status_history')
    .insert([{
      application_id,
      previous_status: previousStatus,
      new_status,
      changed_by,
      reason_note: reason_note || 'Status transitioned via lifecycle manager api execution loop'
    }])
    .select()
    .single();

  if (logErr) throw appError(500, 'DB_ERROR', logErr.message);

  return {
    application_id,
    previous_status: previousStatus,
    current_status: new_status,
    transition_logged_id: logRecord.id
  };
};

/**
 * Returns the historical tracking timeline of a candidate's journey [cite: 560, 561]
 */
export const fetchApplicationJourneyTimeline = async (applicationId) => {
  logger.info(`Assembling end-to-end trace sequence logs for reference id: ${applicationId}`);

  const { data: logs, error: queryErr } = await supabase
    .from('application_status_history')
    .select('*')
    .eq('application_id', applicationId)
    .order('changed_at', { ascending: true });

  if (queryErr) throw appError(500, 'DB_ERROR', queryErr.message);

  return {
    application_id: applicationId,
    total_transitions_recorded: logs?.length || 0,
    timeline_events: logs || []
  };
};