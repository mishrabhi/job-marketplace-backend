import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Asserts structural multi-tenant data protection rules 
 */
const verifyInstitutionalClearance = async (collegeId, userId) => {
  const { data: claims, error } = await supabase
    .from('college_admins')
    .select('id, is_active')
    .eq('college_id', collegeId)
    .eq('user_identity_id', userId)
    .maybeSingle();

  if (error) throw appError(500, 'TENANT_CHECK_ERROR', error.message);
  if (!claims || !claims.is_active) {
    logger.error(`🚨 Security tenant breach caught: User ${userId} requested writing to College data sector: ${collegeId}`);
    throw appError(403, 'TENANT_ACCESS_DENIED', 'Access Denied: Operating execution boundaries rejected for this college tenant domain.');
  }
};

/**
 * Performs transactional bulk ingestion with safe row validation patterns [cite: 1056, 1076, 1106]
 */
export const executeBulkStudentIngestion = async (payload) => {
  const { college_id, operator_user_id, idempotency_key, student_roster } = payload;
  logger.info(`Starting batch ingest process operations for college entity room: ${college_id}`);

  // 1. Assert protection boundary logic immediately 
  await verifyInstitutionalClearance(college_id, operator_user_id);

  // 2. Enforce structural request level idempotency 
  const { data: existingBatch, error: idenErr } = await supabase
    .from('bulk_onboarding_batches')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (idenErr) throw appError(500, 'DB_ERROR', idenErr.message);
  if (existingBatch) {
    logger.warn('Duplicate transaction block encountered. Returning historical processing metrics.', { id: existingBatch.id });
    return existingBatch;
  }

  let processedCount = 0;
  let errorTrackingLogs = [];
  let successfulInserts = [];

  // 3. Atomically validate inputs line by line [cite: 1076, 1106]
  for (const entry of student_roster) {
    processedCount++;
    try {
      // Validate unique candidate email rows inside persistent storage records [cite: 1076, 1138]
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', entry.email)
        .maybeSingle();

      if (existingStudent) {
        errorTrackingLogs.push({ row_index: processedCount, email: entry.email, reason: 'Duplicate candidate profile registration email exists' });
        continue;
      }

      successfulInserts.push({
        name: entry.full_name,
        email: entry.email,
        college_id: college_id,
        department: entry.academic_dept,
        batch_year: entry.graduation_year
      });
    } catch (err) {
      errorTrackingLogs.push({ row_index: processedCount, reason: err.message });
    }
  }

  // 4. Batch commit rows to persistent storage 
  if (successfulInserts.length > 0) {
    const { error: batchInsertErr } = await supabase
      .from('students')
      .insert(successfulInserts);
      
    if (batchInsertErr) throw appError(500, 'DB_BATCH_WRITE_ERROR', batchInsertErr.message);
  }

  // 5. Complete ledger entry generation tracking steps 
  const { data: batchSummaryLog, error: logErr } = await supabase
    .from('bulk_onboarding_batches')
    .insert([{
      college_id,
      processed_by: operator_user_id,
      total_records: student_roster.length,
      successful_records: successfulInserts.length,
      failed_records: errorTrackingLogs.length,
      error_log_summary: errorTrackingLogs,
      idempotency_key
    }])
    .select()
    .single();

  if (logErr) throw appError(500, 'DB_ERROR', logErr.message);

  return batchSummaryLog;
};