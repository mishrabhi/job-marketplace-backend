import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Persists high-throughput pipeline prediction evaluations securely for auditing
 */
export const registerInferenceTrackingData = async (payload) => {
  logger.info(`Recording MLOps telemetry analytics logs for deployment model: ${payload.model_name}`);

  const { data, error } = await supabase
    .from('mlops_inference_logs')
    .insert([payload])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};

/**
 * Commits structural load test execution results into the platform performance ledger
 */
export const persistSystemLoadReport = async (payload) => {
  logger.info(`Persisting platform load test performance snapshot token record: ${payload.test_run_token}`);

  const { data, error } = await supabase
    .from('system_load_test_metrics')
    .insert([payload])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};