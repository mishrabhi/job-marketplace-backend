import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Generates and persists the Phase 3 v2.0 Certification Pack
 */
export const generateCertificationPack = async (payload) => {
  const { tenant_id, certified_by, slo_status, load_test_passed, security_audit_clear, compliance_verified, dr_restore_proven, finops_target_met, idempotency_key } = payload;

  logger.info(`Compiling Phase 3 Certification Pack v2.0 for tenant: ${tenant_id}`);

  // Idempotency assertion
  const { data: existingCert } = await supabase
    .from('phase3_certification_packs')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingCert) {
    return existingCert;
  }

  // All audit parameters must pass for valid certification
  const isFullyCertified = slo_status === 'PASSED' && load_test_passed && security_audit_clear && compliance_verified && dr_restore_proven && finops_target_met;

  if (!isFullyCertified) {
    throw appError(400, 'CERTIFICATION_REJECTED', 'Phase 3 Certification rejected. One or more mandatory quality gates failed.');
  }

  const { data: certRecord, error } = await supabase
    .from('phase3_certification_packs')
    .insert([{
      tenant_id,
      certification_version: 'v2.0.0',
      slo_status,
      load_test_passed,
      security_audit_clear,
      compliance_verified,
      dr_restore_proven,
      finops_target_met,
      certified_by,
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return certRecord;
};

/**
 * Stage C: Executes staged cutover stage with automated error budget monitoring and rollback
 */
export const executeStagedCutoverStage = async (payload) => {
  const { tenant_id, stage_name, canary_traffic_pct, simulated_error_rate_pct, idempotency_key } = payload;

  logger.warn(`🚀 EXECUTING STAGED CUTOVER STAGE '${stage_name}' [Traffic: ${canary_traffic_pct}%] for tenant: ${tenant_id}`);

  // Idempotency check
  const { data: existingCutover } = await supabase
    .from('staged_cutover_executions')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingCutover) {
    return existingCutover;
  }

  // Automated Rollback Guardrail: Trigger instant rollback if error rate exceeds 2.0% threshold
  const shouldRollback = simulated_error_rate_pct > 2.0;
  const status = shouldRollback ? 'ROLLED_BACK' : 'SUCCESSFUL';
  const rollbackReason = shouldRollback ? `Automated Rollback Triggered: Error rate (${simulated_error_rate_pct}%) breached maximum acceptable threshold (2.0%)` : null;

  if (shouldRollback) {
    logger.error(`🚨 CUTOVER ABORTED & ROLLED BACK: ${rollbackReason}`);
  }

  const { data: cutoverRecord, error } = await supabase
    .from('staged_cutover_executions')
    .insert([{
      tenant_id,
      stage_name,
      canary_traffic_pct: shouldRollback ? 0 : canary_traffic_pct,
      cutover_status: status,
      error_rate_pct: simulated_error_rate_pct,
      rollback_reason: rollbackReason,
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return cutoverRecord;
};

/**
 * Stage D: Compiles Post-Launch Health Report and registers Phase-4 Backlog item
 */
export const recordPostLaunchBacklogItem = async (payload) => {
  const { tenant_id, report_type, item_title, severity_priority, details } = payload;

  logger.info(`Registering ${report_type} entry: ${item_title} [Priority: ${severity_priority}]`);

  const { data: record, error } = await supabase
    .from('post_launch_health_backlog')
    .insert([{
      tenant_id,
      report_type,
      item_title,
      severity_priority,
      details
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return record;
};

/**
 * Stage E: Queries complete Phase 3 Certification & Go-Live readiness status
 */
export const getFullCertificationStatus = async (tenantId) => {
  const { data: certPack } = await supabase
    .from('phase3_certification_packs')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  const { data: cutovers } = await supabase
    .from('staged_cutover_executions')
    .select('*')
    .eq('tenant_id', tenantId);

  const { data: backlog } = await supabase
    .from('post_launch_health_backlog')
    .select('*')
    .eq('tenant_id', tenantId);

  const isLiveV2 = cutovers?.some(c => c.canary_traffic_pct === 100 && c.cutover_status === 'SUCCESSFUL');

  return {
    tenant_id: tenantId,
    v2_go_live_status: isLiveV2 ? 'LIVE_IN_PRODUCTION' : 'STAGED_ROLLOUT_IN_PROGRESS',
    certification_pack: certPack || null,
    cutover_execution_history: cutovers || [],
    post_launch_health_and_backlog: backlog || []
  };
};