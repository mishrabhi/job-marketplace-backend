import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Optimized fast signup path with deferred non-critical work
 */
export const executeFastSignup = async (payload) => {
  const { email, full_name, tenant_id, idempotency_key } = payload;
  const startTime = Date.now();

  logger.info(`Processing fast activation signup for email: ${email}`);

  // 1. Idempotency assertion
  const { data: existingMetric } = await supabase
    .from('activation_telemetry_logs')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingMetric) {
    logger.warn('Duplicate activation request caught. Returning cached execution profile.');
    return { status: 'RESOLVED_FROM_IDEMPOTENCY_CACHE', metric_id: existingMetric.id };
  }

  // 2. Duplicate user email check
  const { data: existingUser } = await supabase
    .from('students')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) {
    throw appError(409, 'DUPLICATE_EMAIL', 'An account with this email address already exists.', { email });
  }

  // 3. Fast-path creation of core profile
  const { data: newStudent, error: createErr } = await supabase
    .from('students')
    .insert([{ name: full_name, email, college_id: tenant_id }])
    .select()
    .single();

  if (createErr) throw appError(500, 'DB_ERROR', createErr.message);

  // 4. Offload heavy non-critical work to async queue (e.g. welcome kits, indexing)[cite: 19]
  await supabase.from('async_onboarding_jobs').insert([{
    user_id: newStudent.id,
    tenant_id,
    job_type: 'GENERATE_WELCOME_KIT',
    payload: { email, full_name }
  }]);

  const latencyMs = Date.now() - startTime;

  // 5. Log activation telemetry metric[cite: 19]
  await supabase.from('activation_telemetry_logs').insert([{
    tenant_id,
    user_id: newStudent.id,
    activation_stage: 'signup',
    latency_ms: latencyMs,
    is_success: true,
    idempotency_key
  }]);

  return {
    user: newStudent,
    latency_ms: latencyMs,
    async_jobs_deferred: 1
  };
};

/**
 * Stage C: Complete onboarding profile with forgiving inputs[cite: 19]
 */
export const completeOnboardingProfile = async (payload) => {
  const { user_id, tenant_id, graduation_year, academic_dept, idempotency_key } = payload;
  const startTime = Date.now();

  const { data: updatedStudent, error } = await supabase
    .from('students')
    .update({
      batch_year: graduation_year,
      department: academic_dept
    })
    .eq('id', user_id)
    .eq('college_id', tenant_id)                            // Strict tenant boundary checking[cite: 19]
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!updatedStudent) throw appError(404, 'USER_NOT_FOUND', 'Target student profile missing or tenant mismatch.');

  const latencyMs = Date.now() - startTime;

  await supabase.from('activation_telemetry_logs').insert([{
    tenant_id,
    user_id,
    activation_stage: 'onboarding_profile',
    latency_ms: latencyMs,
    is_success: true,
    idempotency_key
  }]);

  return { student: updatedStudent, latency_ms: latencyMs };
};

/**
 * Stage D: Compiles activation funnel telemetry and success rate improvements[cite: 19]
 */
export const calculateActivationMetrics = async (tenantId) => {
  const { data: logs, error } = await supabase
    .from('activation_telemetry_logs')
    .select('*')
    .eq('tenant_id', tenantId);

  if (error) throw appError(500, 'DB_ERROR', error.message);

  const totalAttempts = logs?.length || 0;
  const successAttempts = logs?.filter(l => l.is_success).length || 0;
  const avgLatencyMs = totalAttempts > 0 
    ? (logs.reduce((acc, curr) => acc + curr.latency_ms, 0) / totalAttempts).toFixed(2)
    : 0;

  return {
    tenant_id: tenantId,
    total_activation_events: totalAttempts,
    successful_activations: successAttempts,
    activation_success_rate_percent: totalAttempts > 0 ? ((successAttempts / totalAttempts) * 100).toFixed(2) : "0.00",
    average_activation_latency_ms: parseFloat(avgLatencyMs)
  };
};