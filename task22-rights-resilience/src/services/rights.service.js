import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Compiles a comprehensive Right to Access porting export snapshot from active persistent tables 
 */
export const compilePortabilityExport = async (userId, idempotencyKey) => {
  logger.info(`Compiling complete data portability archive export profile for data subject user: ${userId}`);

  // Enforce idempotency protection barriers 
  const { data: existingLog } = await supabase
    .from('data_subject_requests_log')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existingLog) {
    logger.warn('Duplicate transaction detected. Returning cached data portability archive artifact.', { id: existingLog.id });
    return existingLog.metadata_summary;
  }

  // Aggregate student and application states in parallel 
  const [studentResult, applicationsResult] = await Promise.all([
    supabase.from('students').select('*').eq('id', userId).maybeSingle(),
    supabase.from('applications').select('*').eq('student_id', userId)
  ]);

  if (studentResult.error || applicationsResult.error) {
    throw appError(500, 'EXPORT_COMPILATION_ERROR', 'Failed compiling data repository mappings cleanly');
  }

  const exportArchive = {
    generated_at: new Date().toISOString(),
    candidate_profile: studentResult.data || null,
    submitted_applications: applicationsResult.data || []
  };

  // Log execution permanently inside compliance historical view ledger 
  await supabase.from('data_subject_requests_log').insert([{
    user_id: userId,
    request_type: 'ACCESS_EXPORT',
    execution_status: 'completed',
    metadata_summary: { total_applications_exported: exportArchive.submitted_applications.length },
    idempotency_key: idempotencyKey
  }]);

  return exportArchive;
};

/**
 * Executes a structural cascaded right to erasure data purge with audit tracking 
 */
export const executeDataErasureCascade = async (userId, idempotencyKey) => {
  logger.info(`🚨 CRITICAL ACTION: Executing data erasure cascaded right purge loop for data subject: ${userId}`);

  // Enforce request level idempotency safeguards 
  const { data: existingLog } = await supabase
    .from('data_subject_requests_log')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existingLog) {
    logger.warn('Duplicate data purge task caught. Returning historical execution log parameters.', { id: existingLog.id });
    return existingLog.metadata_summary;
  }

  // 1. Cascade drop all identifiable student context rows 
  const { error: appErr } = await supabase.from('applications').delete().eq('student_id', userId);
  if (appErr) throw appError(500, 'PURGE_FAILED', `Failed cascading applications files: ${appErr.message}`);

  const { error: studentErr } = await supabase.from('students').delete().eq('id', userId);
  if (studentErr) throw appError(500, 'PURGE_FAILED', `Failed cascading student files: ${studentErr.message}`);

  const operationalPayloadSummary = { cascade_purge_finalized: true, trace_purged_timestamp: new Date().toISOString() };

  // 2. Commit permanent tracking confirmation trace 
  await supabase.from('data_subject_requests_log').insert([{
    user_id: userId,
    request_type: 'ERASURE_PURGE',
    execution_status: 'completed',
    metadata_summary: operationalPayloadSummary,
    idempotency_key: idempotencyKey
  }]);

  return operationalPayloadSummary;
};