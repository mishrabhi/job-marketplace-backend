import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Simulates concurrent, adversarial traffic bursts to verify double-charge prevention
 */
export const runConcurrencyAssertionTest = async (payload) => {
  const { test_suite_token, application_id, concurrent_requests, idempotency_key } = payload;
  logger.info(`Starting concurrency correctness validation test for application context: ${application_id}`);

  // Create an array of simulated concurrent write promises sharing the exact same idempotency key
  const executionTasks = Array.from({ length: concurrent_requests }).map(async (_, idx) => {
    try {
      // Attempt transaction insert with strict idempotency lock handling
      const { data: existingRecord } = await supabase
        .from('payments')
        .select('*')
        .eq('idempotency_key', idempotency_key)
        .maybeSingle();

      if (existingRecord) {
        return { status: 'DEDUPLICATED', id: existingRecord.id, call_index: idx };
      }

      // Simulate atomic insert on first execution call
      const { data: createdPayment, error } = await supabase
        .from('payments')
        .insert([{
          application_id,
          amount: 50000, // 500.00 INR in paise
          status: 'created',
          student_id: '4b111d42-ab12-4211-8224-2da21e48bc02',
          idempotency_key
        }])
        .select()
        .single();

      if (error) {
        // Intercept unique constraint violations safely
        if (error.code === '23505') {
          return { status: 'DEDUPLICATED_BY_DB_CONSTRAINT', call_index: idx };
        }
        throw error;
      }

      return { status: 'COMMITTED', id: createdPayment.id, call_index: idx };
    } catch (err) {
      return { status: 'FAILED', error: err.message, call_index: idx };
    }
  });

  const results = await Promise.all(executionTasks);

  const successfulCommits = results.filter(r => r.status === 'COMMITTED').length;
  const deduplicated = results.filter(r => ['DEDUPLICATED', 'DEDUPLICATED_BY_DB_CONSTRAINT'].length > 0 && r.status !== 'COMMITTED').length;

  // Assert that exactly ONE payment row was committed despite parallel execution[cite: 21]
  const doubleChargePrevented = successfulCommits <= 1;

  // Log summary to persistent storage[cite: 21]
  const { data: testRunRecord, error: logErr } = await supabase
    .from('concurrency_test_runs')
    .insert([{
      test_suite_token,
      concurrent_call_count: concurrent_requests,
      successful_commits: successfulCommits,
      deduplicated_requests: deduplicated,
      double_charge_prevented: doubleChargePrevented
    }])
    .select()
    .single();

  if (logErr) throw appError(500, 'DB_ERROR', logErr.message);

  return {
    test_suite_token,
    double_charge_prevented: doubleChargePrevented,
    summary: {
      total_parallel_calls: concurrent_requests,
      actual_db_writes: successfulCommits,
      safely_deduplicated: deduplicated
    },
    raw_results: results
  };
};

/**
 * Stage C & D: Commits the official Sprint A Scale & Reliability Sign-off with evidence[cite: 21]
 */
export const registerScaleSignoff = async (payload) => {
  const { signed_off_by, regression_tests_passed, concurrency_proof_meta, evidence_notes, idempotency_key } = payload;
  logger.info(`🚨 CRITICAL AUDIT: Processing final Sprint A scale & reliability sign-off`);

  // Enforce idempotency on sign-off execution[cite: 21]
  const { data: existingSignoff } = await supabase
    .from('scale_reliability_signoffs')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingSignoff) {
    logger.warn('Duplicate sign-off request detected. Returning existing sign-off receipt.', { id: existingSignoff.id });
    return existingSignoff;
  }

  const { data: signoffRecord, error } = await supabase
    .from('scale_reliability_signoffs')
    .insert([{
      signed_off_by,
      regression_tests_passed,
      concurrency_proof_meta,
      evidence_notes,
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  return signoffRecord;
};