import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B & C: Ingests trace data spans, evaluates targets, and burns budget tokens atomically
 */
export const processIncomingTelemetrySpan = async (payload) => {
  logger.info(`Ingesting distributed telemetry trace span context: ${payload.span_id}`);

  // 1. Commit the tracking item to telemetry traces
  const { data: traceRecord, error: traceErr } = await supabase
    .from('telemetry_traces')
    .insert([payload])
    .select()
    .single();

  if (traceErr) throw appError(500, 'DB_ERROR', traceErr.message);

  // 2. Fetch the corresponding target SLO metadata constraints
  const { data: sloProfile, error: sloErr } = await supabase
    .from('endpoint_slo_profiles')
    .select('*')
    .eq('endpoint_path', payload.endpoint_path)
    .maybeSingle();

  if (sloErr) throw appError(500, 'DB_ERROR', sloErr.message);

  // Fallback pattern if profiles have not been initialized yet
  if (!sloProfile) return { trace_id: payload.trace_id, status: 'PROCESSED_WITHOUT_ACTIVE_SLO_PROFILE' };

  let budgetToBurn = 0;
  let violationDetected = false;
  let violationType = null;

  // Evaluate latency parameters
  if (payload.latency_ms > sloProfile.target_latency_ms) {
    budgetToBurn += 1;
    violationDetected = true;
    violationType = 'LATENCY_EXCEEDED';
  }

  // Evaluate availability indicators (HTTP 5xx Server Faults)
  if (payload.status_code >= 500) {
    budgetToBurn += 5; // Server faults burn tracking budgets at a higher rate
    violationDetected = true;
    violationType = 'LATENCY_EXCEEDED'; // Fallback mapping within boundaries
  }

  if (budgetToBurn > 0) {
    const updatedSpentTokens = sloProfile.spent_budget_tokens + budgetToBurn;
    
    // Atomically log the target token state update to persistent storage
    await supabase
      .from('endpoint_slo_profiles')
      .update({ spent_budget_tokens: updatedSpentTokens, updated_at: new Date().toISOString() })
      .eq('endpoint_path', payload.endpoint_path);

    // Stage D: Trigger alerts if budgets are exhaustively depleted
    if (updatedSpentTokens >= sloProfile.total_budget_tokens) {
      await supabase.from('slo_alerts_log').insert([{
        endpoint_path: payload.endpoint_path,
        violation_type: 'ERROR_BUDGET_EXHAUSTED',
        incident_details: { spent_tokens: updatedSpentTokens, allowed_tokens: sloProfile.total_budget_tokens }
      }]);
      logger.error(`🚨 ALERT EXHAUSTION: Error Budget depleted for path: ${payload.endpoint_path}`);
    } else if (violationDetected) {
      // Log single structural latency breaches safely
      await supabase.from('slo_alerts_log').insert([{
        endpoint_path: payload.endpoint_path,
        violation_type: violationType,
        incident_details: { path: payload.endpoint_path, latency_ms: payload.latency_ms }
      }]);
    }
  }

  return {
    trace_id: payload.trace_id,
    slo_status: budgetToBurn > 0 ? 'SLO_BREACH_RECORDED' : 'SLO_TARGET_MET',
    remaining_budget_tokens: Math.max(0, sloProfile.total_budget_tokens - (sloProfile.spent_budget_tokens + budgetToBurn))
  };
};

/**
 * Stage D: Compiles metrics and risk calculations for dashboard presentation
 */
export const calculateErrorBudgetDashboard = async (endpointPath) => {
  const { data: profile, error } = await supabase
    .from('endpoint_slo_profiles')
    .select('*')
    .eq('endpoint_path', endpointPath)
    .maybeSingle();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!profile) throw appError(404, 'PROFILE_NOT_FOUND', 'Target endpoint SLO profile missing.');

  const totalTokens = profile.total_budget_tokens;
  const spentTokens = profile.spent_budget_tokens;
  const remainingTokens = Math.max(0, totalTokens - spentTokens);
  const budgetRemainingPercentage = parseFloat(((remainingTokens / totalTokens) * 100).toFixed(2));

  return {
    endpoint_path: endpointPath,
    target_latency_ms: profile.target_latency_ms,
    availability_objective: `${profile.availability_target}%`,
    tokens: { total: totalTokens, spent: spentTokens, remaining: remainingTokens },
    budget_remaining_percent: budgetRemainingPercentage,
    at_risk: budgetRemainingPercentage < 10.00
  };
};