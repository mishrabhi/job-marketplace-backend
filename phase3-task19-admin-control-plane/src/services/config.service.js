import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B & C: Updates tenant configuration with guardrail checks and audit logging[cite: 17]
 */
export const updateTenantConfiguration = async (payload) => {
  const { tenant_id, admin_user_id, primary_color_hex, company_logo_url, custom_domain, max_concurrent_jobs, rate_limit_per_min, reason_notes, idempotency_key } = payload;

  logger.info(`Updating configuration for tenant: ${tenant_id} by Admin: ${admin_user_id}`);

  // 1. Enforce idempotency on audit logging[cite: 17]
  const { data: existingAudit } = await supabase
    .from('admin_action_audit_logs')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingAudit) {
    logger.warn('Duplicate admin config change request caught. Returning cached audit entry.', { id: existingAudit.id });
    return { status: 'RESOLVED_FROM_IDEMPOTENCY_CACHE', audit_log: existingAudit };
  }

  // 2. Fetch current configuration state for rollback snapshot[cite: 17]
  const { data: currentConfig } = await supabase
    .from('tenant_configurations')
    .select('*')
    .eq('tenant_id', tenant_id)
    .maybeSingle();

  const previousSnapshot = currentConfig || {};

  // 3. Apply configuration changes[cite: 17]
  const { data: updatedConfig, error: updateErr } = await supabase
    .from('tenant_configurations')
    .upsert({
      tenant_id,                                              // Strict multi-tenant isolation boundary[cite: 17]
      primary_color_hex,
      company_logo_url,
      custom_domain: custom_domain || null,
      max_concurrent_jobs,
      rate_limit_per_min,
      updated_at: new Date().toISOString()
    }, { onConflict: 'tenant_id' })
    .select()
    .single();

  if (updateErr) throw appError(500, 'DB_ERROR', updateErr.message);

  // 4. Log admin action with state snapshots for rollback[cite: 17]
  const { data: auditLog, error: auditErr } = await supabase
    .from('admin_action_audit_logs')
    .insert([{
      tenant_id,
      action_type: 'CONFIG_UPDATE',
      performed_by: admin_user_id,
      previous_snapshot: previousSnapshot,
      new_snapshot: updatedConfig,
      reason_notes,
      idempotency_key
    }])
    .select()
    .single();

  if (auditErr) throw appError(500, 'DB_ERROR', auditErr.message);

  return {
    configuration: updatedConfig,
    audit_log: auditLog
  };
};

/**
 * Stage D: Reverts a tenant configuration back to a previous audited snapshot[cite: 17]
 */
export const rollbackTenantConfiguration = async (payload) => {
  const { tenant_id, admin_user_id, target_audit_log_id, reason_notes, idempotency_key } = payload;

  logger.warn(`🚨 ROLLBACK TRIGGERED: Reverting tenant ${tenant_id} config via audit target ${target_audit_log_id}`);

  // 1. Check idempotency for rollback execution
  const { data: existingRollbackAudit } = await supabase
    .from('admin_action_audit_logs')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingRollbackAudit) {
    return { status: 'RESOLVED_FROM_IDEMPOTENCY_CACHE', audit_log: existingRollbackAudit };
  }

  // 2. Retrieve target audit log snapshot[cite: 17]
  const { data: targetAudit, error: auditFetchErr } = await supabase
    .from('admin_action_audit_logs')
    .select('*')
    .eq('id', target_audit_log_id)
    .eq('tenant_id', tenant_id)                               // Strict multi-tenant boundary[cite: 17]
    .maybeSingle();

  if (auditFetchErr || !targetAudit) {
    throw appError(404, 'AUDIT_LOG_NOT_FOUND', 'Target audit log entry for rollback missing or tenant mismatch.');
  }

  const previousState = targetAudit.previous_snapshot;

  if (!previousState || !previousState.primary_color_hex) {
    throw appError(400, 'INVALID_ROLLBACK_STATE', 'Target audit snapshot does not contain a valid configuration state to restore.');
  }

  // 3. Fetch current state before applying rollback
  const { data: currentConfig } = await supabase
    .from('tenant_configurations')
    .select('*')
    .eq('tenant_id', tenant_id)
    .single();

  // 4. Restore configuration to target snapshot state[cite: 17]
  const { data: restoredConfig, error: restoreErr } = await supabase
    .from('tenant_configurations')
    .update({
      primary_color_hex: previousState.primary_color_hex,
      company_logo_url: previousState.company_logo_url,
      custom_domain: previousState.custom_domain,
      max_concurrent_jobs: previousState.max_concurrent_jobs,
      rate_limit_per_min: previousState.rate_limit_per_min,
      updated_at: new Date().toISOString()
    })
    .eq('tenant_id', tenant_id)
    .select()
    .single();

  if (restoreErr) throw appError(500, 'DB_ERROR', restoreErr.message);

  // 5. Log rollback execution in audit ledger[cite: 17]
  const { data: rollbackAuditRecord, error: logErr } = await supabase
    .from('admin_action_audit_logs')
    .insert([{
      tenant_id,
      action_type: 'CONFIG_ROLLBACK',
      performed_by: admin_user_id,
      previous_snapshot: currentConfig,
      new_snapshot: restoredConfig,
      reason_notes: `Rollback to audit log state ${target_audit_log_id}: ${reason_notes}`,
      idempotency_key
    }])
    .select()
    .single();

  if (logErr) throw appError(500, 'DB_ERROR', logErr.message);

  return {
    status: 'ROLLBACK_SUCCESSFUL',
    restored_configuration: restoredConfig,
    rollback_audit_log: rollbackAuditRecord
  };
};

/**
 * Fetch tenant configuration by ID
 */
export const getTenantConfiguration = async (tenantId) => {
  const { data: config, error } = await supabase
    .from('tenant_configurations')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!config) throw appError(404, 'NOT_FOUND', 'Configuration for tenant not found.');

  return config;
};