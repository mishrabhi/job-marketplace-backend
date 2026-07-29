import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Strict Output Contract Validator for Model Responses
 */
const validateModelContract = (response) => {
  if (!response || typeof response !== 'object') return false;
  if (!Array.isArray(response.predictions)) return false;
  return response.predictions.every(p => typeof p.candidate_id === 'string' && typeof p.score === 'number');
};

/**
 * Heuristic Fallback Ranking Logic[cite: 18]
 */
const executeHeuristicFallback = (candidateIds) => {
  return candidateIds.map((id, idx) => ({
    candidate_id: id,
    score: parseFloat((1.0 - idx * 0.05).toFixed(2)),
    fallback_applied: true
  }));
};

/**
 * Stage B & C: Governed Model Invocation with Hard Timeouts and Fallbacks[cite: 18]
 */
export const invokeGovernedModelPipeline = async (payload) => {
  const { surface_name, tenant_id, candidate_ids, simulation_mode } = payload;
  const startTime = Date.now();

  logger.info(`Invoking governed surface: ${surface_name} for tenant: ${tenant_id} under mode: ${simulation_mode}`);

  // 1. Fetch pinned policy from governance registry[cite: 18]
  let { data: policy } = await supabase
    .from('model_governance_policies')
    .select('*')
    .eq('surface_name', surface_name)
    .maybeSingle();

  if (!policy) {
    // Seed default policy if missing[cite: 18]
    const { data: seeded } = await supabase
      .from('model_governance_policies')
      .insert([{
        surface_name,
        pinned_version: 'ltr_v1.0_pinned',
        hard_timeout_ms: env.DEFAULT_MODEL_TIMEOUT_MS,
        fallback_strategy: 'HEURISTIC_SCORE'
      }])
      .select()
      .single();
    policy = seeded;
  }

  let finalPredictions = [];
  let failureMode = null;
  let usedFallback = false;

  try {
    // 2. Execute simulated model call with hard timeout[cite: 18]
    const rawModelResult = await Promise.race([
      simulateModelServiceCall(candidate_ids, simulation_mode),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('MODEL_TIMEOUT')), policy.hard_timeout_ms)
      )
    ]);

    // Contract validation check[cite: 18]
    if (!validateModelContract(rawModelResult)) {
      throw new Error('CONTRACT_INVALID');
    }

    finalPredictions = rawModelResult.predictions;

  } catch (err) {
    usedFallback = true;
    if (err.message === 'MODEL_TIMEOUT') {
      failureMode = 'MODEL_SLOW';
    } else if (err.message === 'CONTRACT_INVALID') {
      failureMode = 'MODEL_WRONG_CONTRACT';
    } else {
      failureMode = 'MODEL_OFF';
    }

    logger.warn(`🚨 GOVERNANCE INTERCEPT: ${failureMode} detected on ${surface_name}. Executing ${policy.fallback_strategy}.`);

    // Execute fallback strategy[cite: 18]
    if (policy.fallback_strategy === 'HEURISTIC_SCORE') {
      finalPredictions = executeHeuristicFallback(candidate_ids);
    } else {
      finalPredictions = [];
    }

    // Persist fallback audit event[cite: 18]
    await supabase.from('model_fallback_events').insert([{
      surface_name,
      tenant_id,                                           // Strict multi-tenant isolation[cite: 18]
      failure_mode: failureMode,
      latency_ms: Date.now() - startTime,
      fallback_used: policy.fallback_strategy
    }]);
  }

  return {
    surface_name,
    pinned_model_version: policy.pinned_version,            // Version pinning[cite: 18]
    tenant_id,
    execution_time_ms: Date.now() - startTime,
    governance_status: {
      used_fallback: usedFallback,
      failure_mode: failureMode
    },
    results: finalPredictions
  };
};

/**
 * Simulates external model service behavior for integration testing[cite: 18]
 */
const simulateModelServiceCall = async (candidateIds, mode) => {
  if (mode === 'MODEL_OFF') {
    throw new Error('CONNECTION_REFUSED');
  }
  if (mode === 'MODEL_SLOW') {
    await new Promise(r => setTimeout(r, 300));             // Delay exceeds 150ms timeout[cite: 18]
  }
  if (mode === 'MODEL_WRONG') {
    return { predictions: "GARBAGE_NON_ARRAY_STRING" };    // Invalid schema[cite: 18]
  }

  return {
    predictions: candidateIds.map(id => ({ candidate_id: id, score: 0.95 }))
  };
};

/**
 * Stage B: Configure or update governance pinning policies[cite: 18]
 */
export const updateGovernancePolicy = async (payload) => {
  const { surface_name, pinned_version, hard_timeout_ms, fallback_strategy } = payload;

  const { data, error } = await supabase
    .from('model_governance_policies')
    .upsert({
      surface_name,
      pinned_version,
      hard_timeout_ms,
      fallback_strategy,
      updated_at: new Date().toISOString()
    }, { onConflict: 'surface_name' })
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};