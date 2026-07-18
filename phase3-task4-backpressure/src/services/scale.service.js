import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Stage B: Commits load testing execution configuration matrices[cite: 20]
 */
export const registerLoadExecution = async (payload) => {
  logger.info(`Recording marketplace concurrency scale run data loop for token: ${payload.test_run_token}`);

  const { data, error } = await supabase
    .from('platform_load_runs')
    .insert([payload])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};

/**
 * Stage C: Documents identified breaking thresholds and dependency constraints[cite: 20]
 */
export const recordSystemBreakingThreshold = async (payload) => {
  logger.info(`Logging breaking point parameters to diagnostics ledger: ${payload.test_run_token}`);

  const { data, error } = await supabase
    .from('system_breaking_points')
    .insert([payload])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};

/**
 * Stage D: Simulates an isolated outbound gateway execution wrapper configured with rigid timeouts[cite: 20]
 */
export const simulateOutboundCallWithTimeout = async (shouldFail = false) => {
  return new Promise(async (resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      reject(appError(504, 'GATEWAY_TIMEOUT', 'Outbound call timed out: Enforced backpressure timeout triggered safely.'));
    }, env.OUTBOUND_CALL_TIMEOUT_MS);

    try {
      // Simulate real processing latency patterns
      const simulationDelay = shouldFail ? env.OUTBOUND_CALL_TIMEOUT_MS + 500 : 100;
      await new Promise(r => setTimeout(r, simulationDelay));

      clearTimeout(timeoutHandle);
      
      // Update Circuit Breaker state to SUCCESS if HALF_OPEN
      await supabase
        .from('circuit_breaker_states')
        .update({ current_state: 'CLOSED', failure_count: 0, updated_at: new Date().toISOString() })
        .eq('dependency_name', 'RAZORPAY_GATEWAY');

      resolve({ status: 'TRANSACTION_CAPTURED_SUCCESSFULLY', execution_ms: simulationDelay });
    } catch (err) {
      clearTimeout(timeoutHandle);
      reject(err);
    }
  });
};

/**
 * Tripping mechanism update hook to change circuit states dynamically
 */
export const recordDependencyFailure = async () => {
  const dependency = 'RAZORPAY_GATEWAY';
  const { data: profile } = await supabase.from('circuit_breaker_states').select('*').eq('dependency_name', dependency).single();
  
  const incrementedFailures = profile.failure_count + 1;
  let nextState = profile.current_state;
  let tripTime = profile.last_tripped_at;

  if (incrementedFailures >= env.BREAKER_FAILURE_THRESHOLD || profile.current_state === 'HALF_OPEN') {
    nextState = 'OPEN';
    tripTime = new Date().toISOString();
    logger.error(`🚨 CIRCUIT BREAKER TRIPPED CRITICAL: Dependency ${dependency} is now OPEN. Backpressure shedding live.`);
  }

  await supabase
    .from('circuit_breaker_states')
    .update({ current_state: nextState, failure_count: incrementedFailures, last_tripped_at: tripTime, updated_at: new Date().toISOString() })
    .eq('dependency_name', dependency);
};