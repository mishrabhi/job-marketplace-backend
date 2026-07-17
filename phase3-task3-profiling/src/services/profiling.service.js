import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Records endpoint profiling traces to identify architectural flaws
 */
export const insertPerformanceProfile = async (payload) => {
  logger.info(`Logging telemetry profiling metric for path context: ${payload.endpoint_path}`);

  const { data, error } = await supabase
    .from('query_performance_profiles')
    .insert([payload])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};

/**
 * Stage C & D: Enforces strict data logging for before/after P95 validation proofs
 */
export const registerOptimizedBenchmark = async (payload) => {
  const { endpoint_path, p95_latency_before, p95_latency_after, optimization_applied } = payload;
  logger.info(`Registering verified optimization latency data footprint for path: ${endpoint_path}`);

  // Enforce concurrency validation via update/insert mapping blocks
  const { data: existingBenchmark } = await supabase
    .from('latency_benchmarks_log')
    .select('*')
    .eq('endpoint_path', endpoint_path)
    .maybeSingle();

  if (existingBenchmark) {
    const { data: updatedRecord, error: uErr } = await supabase
      .from('latency_benchmarks_log')
      .update({
        p95_latency_before,
        p95_latency_after,
        optimization_applied,
        updated_at: new Date().toISOString()
      })
      .eq('endpoint_path', endpoint_path)
      .select()
      .single();

    if (uErr) throw appError(500, 'DB_ERROR', uErr.message);
    return updatedRecord;
  }

  const { data: newRecord, error: iErr } = await supabase
    .from('latency_benchmarks_log')
    .insert([{ endpoint_path, p95_latency_before, p95_latency_after, optimization_applied }])
    .select()
    .single();

  if (iErr) throw appError(500, 'DB_ERROR', iErr.message);
  return newRecord;
};