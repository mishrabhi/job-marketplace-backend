import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Append-only immutable decision audit log insertion[cite: 18]
 */
export const logAutomatedDecision = async (payload) => {
  const { decision_token, tenant_id, candidate_id, application_id, model_version, decision_type, decision_reason, feature_weights, input_snapshot } = payload;

  logger.info(`Logging automated decision: ${decision_type} for candidate: ${candidate_id} via model: ${model_version}`);

  const { data: auditRecord, error } = await supabase
    .from('decision_audit_logs')
    .insert([{
      decision_token,
      tenant_id,                                              // Strict multi-tenant tracking[cite: 18]
      candidate_id,
      application_id,
      model_version,
      decision_type,
      decision_reason,
      feature_weights,
      input_snapshot
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {                             // Handle idempotency/duplicate token gracefully[cite: 18]
      const { data: existing } = await supabase.from('decision_audit_logs').select('*').eq('decision_token', decision_token).single();
      return existing;
    }
    throw appError(500, 'DB_ERROR', error.message);
  }

  return auditRecord;
};

/**
 * Stage C: Explanation API - Returns feature breakdown and reasons for a specific decision token[cite: 18]
 */
export const getDecisionExplanation = async (decisionToken, tenantId) => {
  logger.info(`Generating decision explanation for token: ${decisionToken} in tenant: ${tenantId}`);

  const { data: auditLog, error } = await supabase
    .from('decision_audit_logs')
    .select('*')
    .eq('decision_token', decisionToken)
    .eq('tenant_id', tenantId)                                // Pre-filtered multi-tenant check[cite: 18]
    .maybeSingle();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!auditLog) throw appError(404, 'NOT_FOUND', 'Decision audit record missing or tenant mismatch.');

  return {
    decision_token: auditLog.decision_token,
    candidate_id: auditLog.candidate_id,
    model_version: auditLog.model_version,
    decision_type: auditLog.decision_type,
    summary_reason: auditLog.decision_reason,
    explainability_factors: {
      feature_importance: auditLog.feature_weights,
      input_snapshot: auditLog.input_snapshot
    },
    appeal_available: true,
    created_at: auditLog.created_at
  };
};

/**
 * Stage D: Human-Review / Appeal submission API[cite: 18]
 */
export const submitCandidateAppeal = async (payload) => {
  const { decision_token, candidate_id, tenant_id, appeal_reason, idempotency_key } = payload;

  logger.info(`Submitting candidate appeal for decision token: ${decision_token}`);

  // Idempotency check[cite: 18]
  const { data: existingAppeal } = await supabase
    .from('candidate_decision_appeals')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingAppeal) {
    logger.warn('Duplicate appeal submission caught. Returning cached appeal record.', { id: existingAppeal.id });
    return existingAppeal;
  }

  // Verify that the decision token exists and matches candidate + tenant[cite: 18]
  const { data: decisionLog } = await supabase
    .from('decision_audit_logs')
    .select('id')
    .eq('decision_token', decision_token)
    .eq('candidate_id', candidate_id)
    .eq('tenant_id', tenant_id)
    .maybeSingle();

  if (!decisionLog) {
    throw appError(404, 'INVALID_DECISION_TOKEN', 'No matching decision record found for this candidate and tenant.');
  }

  const { data: appealRecord, error } = await supabase
    .from('candidate_decision_appeals')
    .insert([{
      decision_token,
      candidate_id,
      tenant_id,
      appeal_reason,
      status: 'submitted',
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return appealRecord;
};

/**
 * Stage D: Adjudicate appeal (Overturn / Upheld by Human Reviewer)[cite: 18]
 */
export const adjudicateAppeal = async (payload) => {
  const { appeal_id, tenant_id, status, reviewer_notes, reviewed_by } = payload;

  logger.info(`Adjudicating appeal ID: ${appeal_id} to status: ${status} by Reviewer: ${reviewed_by}`);

  const { data: updatedAppeal, error } = await supabase
    .from('candidate_decision_appeals')
    .update({
      status,
      reviewer_notes,
      reviewed_by,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', appeal_id)
    .eq('tenant_id', tenant_id)                              // Multi-tenant check[cite: 18]
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!updatedAppeal) throw appError(404, 'NOT_FOUND', 'Target appeal record missing or tenant mismatch.');

  return updatedAppeal;
};