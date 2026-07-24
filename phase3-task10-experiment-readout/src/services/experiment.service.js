import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Records a conversion outcome linked to an exposure event[cite: 19]
 */
export const registerExperimentOutcome = async (payload) => {
  const { flag_key, user_id, tenant_id, assigned_variant, outcome_event_type, idempotency_key } = payload;
  logger.info(`Logging experiment outcome for flag: ${flag_key}, variant: ${assigned_variant}, user: ${user_id}`);

  // 1. Idempotency assertion[cite: 19]
  const { data: existingOutcome } = await supabase
    .from('experiment_outcomes')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingOutcome) {
    logger.warn('Duplicate outcome record caught. Returning cached receipt.', { id: existingOutcome.id });
    return existingOutcome;
  }

  // 2. Insert outcome event[cite: 19]
  const { data: outcomeRecord, error } = await supabase
    .from('experiment_outcomes')
    .insert([{
      flag_key,
      user_id,
      tenant_id,                                              // Multi-tenant boundary check[cite: 19]
      assigned_variant,
      outcome_event_type,
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return outcomeRecord;
};

/**
 * Stage C: Generates experiment readout analytics and detects Sample-Ratio Mismatch (SRM)[cite: 19]
 */
export const generateExperimentReadout = async (flagKey, tenantId) => {
  logger.info(`Generating analytical readout & SRM metrics for flag: ${flagKey}`);

  // Fetch exposure counts grouped by variant for this tenant[cite: 19]
  const { data: exposures, error: expErr } = await supabase
    .from('experiment_exposures')
    .select('assigned_variant, user_id')
    .eq('flag_key', flagKey)
    .eq('tenant_id', tenantId);

  if (expErr) throw appError(500, 'DB_ERROR', expErr.message);

  // Fetch conversion outcomes grouped by variant for this tenant[cite: 19]
  const { data: outcomes, error: outErr } = await supabase
    .from('experiment_outcomes')
    .select('assigned_variant, user_id')
    .eq('flag_key', flagKey)
    .eq('tenant_id', tenantId);

  if (outErr) throw appError(500, 'DB_ERROR', outErr.message);

  const variantCounts = {};
  const conversionCounts = {};

  exposures?.forEach(exp => {
    variantCounts[exp.assigned_variant] = (variantCounts[exp.assigned_variant] || 0) + 1;
  });

  outcomes?.forEach(out => {
    conversionCounts[out.assigned_variant] = (conversionCounts[out.assigned_variant] || 0) + 1;
  });

  const totalExposures = exposures?.length || 0;
  const variants = Object.keys(variantCounts);

  // Detect Sample-Ratio Mismatch (SRM): Check if traffic split deviates significantly from equal allocation[cite: 19]
  let srmDetected = false;
  let srmReason = "Traffic split within acceptable parameters.";

  if (variants.length >= 2 && totalExposures > 20) {
    const expectedRatio = 1 / variants.length;
    for (const v of variants) {
      const actualRatio = variantCounts[v] / totalExposures;
      if (Math.abs(actualRatio - expectedRatio) > 0.15) {    // >15% deviation triggers SRM alert[cite: 19]
        srmDetected = true;
        srmReason = `SRM ALERT: Variant '${v}' received ${(actualRatio * 100).toFixed(1)}% of traffic, deviating from expected ${(expectedRatio * 100).toFixed(1)}% split.`;
        logger.error(`🚨 ${srmReason}`);
        break;
      }
    }
  }

  const breakdown = variants.map(v => {
    const expCount = variantCounts[v] || 0;
    const convCount = conversionCounts[v] || 0;
    return {
      variant: v,
      exposures: expCount,
      conversions: convCount,
      conversion_rate_percent: expCount > 0 ? ((convCount / expCount) * 100).toFixed(2) : "0.00"
    };
  });

  return {
    flag_key: flagKey,
    tenant_id: tenantId,
    total_exposures: totalExposures,
    srm_check: {
      srm_detected: srmDetected,
      details: srmReason
    },
    variant_performance: breakdown
  };
};

/**
 * Stage D: Automated zombie-flag cleanup process to eliminate flag debt[cite: 19]
 */
export const purgeZombieFlags = async (performedBy) => {
  logger.info(`🚨 EXECUTING ZOMBIE FLAG CLEANUP RUN by Admin: ${performedBy}`);

  const now = new Date().toISOString();

  // Find expired flags or flags inactive for over 30 days[cite: 19]
  const { data: expiredFlags, error: fetchErr } = await supabase
    .from('feature_flags')
    .select('*')
    .or(`expires_at.lt.${now},is_active.eq.false`);

  if (fetchErr) throw appError(500, 'DB_ERROR', fetchErr.message);

  let purgedCount = 0;
  const auditLogs = [];

  for (const flag of (expiredFlags || [])) {
    const reason = flag.expires_at && new Date(flag.expires_at) < new Date() ? 'EXPIRED' : 'INACTIVE_ABANDONED';

    // Delete the zombie flag[cite: 19]
    const { error: delErr } = await supabase
      .from('feature_flags')
      .delete()
      .eq('id', flag.id);

    if (!delErr) {
      purgedCount++;
      auditLogs.push({
        flag_key: flag.flag_key,
        cleanup_reason: reason,
        performed_by: performedBy
      });
    }
  }

  if (auditLogs.length > 0) {
    await supabase.from('flag_cleanup_audit_logs').insert(auditLogs);
  }

  return {
    total_zombie_flags_purged: purgedCount,
    purged_flags: auditLogs
  };
};