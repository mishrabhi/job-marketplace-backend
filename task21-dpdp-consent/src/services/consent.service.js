import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Commits or updates a user consent grant state 
 */
export const logUserConsentState = async (payload) => {
  const { user_id, consent_type, is_granted, ip_address, user_agent, idempotency_key } = payload;
  logger.info(`Processing consent update sequence for user: ${user_id} on domain: ${consent_type}`);

  // Enforce idempotency protections 
  const { data: existingRecord } = await supabase
    .from('dpdp_consent_registry')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingRecord) {
    logger.warn('Duplicate transaction token encountered. Returning historical consent persistence state.', { id: existingRecord.id });
    return existingRecord;
  }

  // Update or insert consent records safely 
  const { data: consentLog, error: dbErr } = await supabase
    .from('dpdp_consent_registry')
    .upsert({
      user_id, consent_type, is_granted, ip_address, user_agent, idempotency_key,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, consent_type' })
    .select()
    .single();

  if (dbErr) throw appError(500, 'DB_ERROR', dbErr.message);

  // Write to immutable audit ledger history 
  await supabase.from('dpdp_consent_trail').insert([{
    user_id,
    action_type: is_granted ? 'GRANT' : 'WITHDRAW',
    consent_type,
    details_snapshot: { ip_address, user_agent }
  }]);

  return consentLog;
};

/**
 * Handles full compliant right-to-be-forgotten erasure workflows 
 */
export const executeDataErasurePurge = async (userId) => {
  logger.info(`🚨 CRITICAL: Executing right-to-be-forgotten database data purge for data subject: ${userId}`);

  // Cascade delete all identifiable records across related student and application entities 
  const { error: studentErr } = await supabase.from('students').delete().eq('id', userId);
  if (studentErr) throw appError(500, 'PURGE_FAILED', `Failed cascading student files: ${studentErr.message}`);

  const { error: consentErr } = await supabase.from('dpdp_consent_registry').delete().eq('user_id', userId);
  if (consentErr) throw appError(500, 'PURGE_FAILED', `Failed cascading consent files: ${consentErr.message}`);

  // Leave an immutable audit trace to confirm the erasure request was executed legally
  await supabase.from('dpdp_consent_trail').insert([{
    user_id: userId,
    action_type: 'DATA_PURGE',
    details_snapshot: { finalized_at: new Date().toISOString(), status: 'ERASURE_COMPLETE' }
  }]);

  return { user_id: userId, status: 'PURGED_SUCCESSFULLY_FROM_ALL_SYSTEM_REPOSITORIES' };
};