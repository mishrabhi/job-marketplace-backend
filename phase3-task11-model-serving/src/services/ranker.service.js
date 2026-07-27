import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Simulated internal ranking inference calculations[cite: 19]
 */
const runInferenceModel = (modelVersion, candidateJobIds) => {
  return candidateJobIds.map((jobId, idx) => ({
    job_id: jobId,
    score: parseFloat((Math.random() * (0.99 - 0.50) + 0.50).toFixed(4)),
    rank: idx + 1
  })).sort((a, b) => b.score - a.score);
};

/**
 * Stage B & C: Serves candidate rankings using primary, shadow, or canary configurations[cite: 19]
 */
export const serveRankings = async (payload) => {
  const { student_id, tenant_id, candidate_job_ids, idempotency_key } = payload;
  const startTime = Date.now();

  logger.info(`Processing ranking inference request for student: ${student_id}`);

  // 1. Fetch active primary and shadow/canary model deployments[cite: 19]
  const { data: deployments, error: depErr } = await supabase
    .from('ranker_model_deployments')
    .select('*')
    .neq('deployment_mode', 'disabled');

  if (depErr) throw appError(500, 'DB_ERROR', depErr.message);

  const primaryModel = deployments?.find(d => d.deployment_mode === 'primary') || {
    model_version: 'ltr_v1.0_baseline',
    max_allowed_latency: env.RANKING_LATENCY_BUDGET_MS
  };

  const activeCanaryOrShadow = deployments?.find(d => ['canary', 'shadow'].includes(d.deployment_mode));

  let servedModelVersion = primaryModel.model_version;
  let primaryScores = runInferenceModel(primaryModel.model_version, candidate_job_ids);
  let shadowScores = [];
  let servedScores = primaryScores;

  // 2. Handle Shadow-Mode or Canary Rollout execution[cite: 19]
  if (activeCanaryOrShadow) {
    const secondaryVersion = activeCanaryOrShadow.model_version;

    if (activeCanaryOrShadow.deployment_mode === 'shadow') {
      // Shadow Mode: Score shadow model concurrently, but DO NOT show results to user[cite: 19]
      shadowScores = runInferenceModel(secondaryVersion, candidate_job_ids);
      logger.info(`👻 Shadow mode executed for model: ${secondaryVersion}. Scores logged but withheld.`);
    } else if (activeCanaryOrShadow.deployment_mode === 'canary') {
      // Canary Mode: Serve canary model to configured % of traffic[cite: 19]
      const randomRoll = Math.floor(Math.random() * 100);
      if (randomRoll < activeCanaryOrShadow.canary_traffic_pct) {
        servedModelVersion = secondaryVersion;
        servedScores = runInferenceModel(secondaryVersion, candidate_job_ids);
        logger.info(`🐥 Canary traffic routed to model: ${secondaryVersion} (${activeCanaryOrShadow.canary_traffic_pct}% allocation)`);
      }
    }
  }

  const latencyMs = Date.now() - startTime;
  const isLatencyBreached = latencyMs > primaryModel.max_allowed_latency;

  // Stage D: Enforce automatic rollback trigger if guardrails are breached[cite: 19]
  if (isLatencyBreached && activeCanaryOrShadow?.deployment_mode === 'canary') {
    logger.error(`🚨 GUARDRAIL BREACH: Latency ${latencyMs}ms exceeded budget ${primaryModel.max_allowed_latency}ms. Triggering automatic canary rollback!`);
    await rollbackCanaryModel(activeCanaryOrShadow.model_version);
  }

  // 3. Persist inference telemetry[cite: 19]
  await supabase.from('ranker_inference_logs').insert([{
    request_id: idempotency_key,
    tenant_id,                                              // Strict multi-tenant boundary[cite: 19]
    student_id,
    primary_model_ver: primaryModel.model_version,
    primary_scores: primaryScores,
    shadow_model_ver: activeCanaryOrShadow ? activeCanaryOrShadow.model_version : null,
    shadow_scores: shadowScores,
    served_model_ver: servedModelVersion,
    inference_latency_ms: latencyMs,
    guardrail_breached: isLatencyBreached
  }]);

  return {
    served_model_version: servedModelVersion,
    inference_latency_ms: latencyMs,
    latency_budget_ms: primaryModel.max_allowed_latency,
    latency_budget_cleared: !isLatencyBreached,
    rankings: servedScores
  };
};

/**
 * Stage C: Automatic rollback execution function when guardrails are breached[cite: 19]
 */
export const rollbackCanaryModel = async (modelVersion) => {
  logger.warn(`Disabling canary model: ${modelVersion} due to guardrail breach.`);

  const { data, error } = await supabase
    .from('ranker_model_deployments')
    .update({ deployment_mode: 'disabled', canary_traffic_pct: 0, updated_at: new Date().toISOString() })
    .eq('model_version', modelVersion)
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};

/**
 * Configures model deployment mode (Shadow, Canary, Primary)[cite: 19]
 */
export const updateDeploymentConfig = async (payload) => {
  const { model_version, deployment_mode, canary_traffic_pct, max_allowed_latency } = payload;

  const { data, error } = await supabase
    .from('ranker_model_deployments')
    .upsert({
      model_version,
      deployment_mode,
      canary_traffic_pct,
      max_allowed_latency,
      updated_at: new Date().toISOString()
    }, { onConflict: 'model_version' })
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};