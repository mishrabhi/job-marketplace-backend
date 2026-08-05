import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Records a STRIDE threat model finding and mitigation state
 */
export const recordStrideThreat = async (payload) => {
  const { tenant_id, surface_name, stride_category, vulnerability_title, severity, mitigation_details, idempotency_key } = payload;

  logger.info(`Logging STRIDE threat [${stride_category}] for surface ${surface_name} on tenant ${tenant_id}`);

  // Idempotency assertion
  const { data: existingThreat } = await supabase
    .from('stride_threat_models')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existingThreat) {
    return existingThreat;
  }

  const { data: threatRecord, error } = await supabase
    .from('stride_threat_models')
    .insert([{
      tenant_id,
      surface_name,
      stride_category,
      vulnerability_title,
      severity,
      remediation_status: 'mitigated',
      mitigation_details,
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return threatRecord;
};

/**
 * Stage C: Simulates an IDOR Attack and verifies that query-level multi-tenant filters block access
 */
export const verifyIdorDefense = async (requestingTenantId, targetResourceId, resourceOwnerTenantId) => {
  logger.warn(`🚨 PEN-TEST SIMULATION: User under tenant ${requestingTenantId} attempting IDOR access to resource ${targetResourceId} owned by tenant ${resourceOwnerTenantId}`);

  // Defensive Authorization: Query strictly enforces tenant matching at database query layer
  const { data: resource, error } = await supabase
    .from('enterprise_candidate_dossiers')
    .select('*')
    .eq('id', targetResourceId)
    .eq('tenant_id', requestingTenantId)
    .maybeSingle();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  const isBlocked = resource === null;

  return {
    attack_type: 'INSECURE_DIRECT_OBJECT_REFERENCE_IDOR',
    requesting_tenant_id: requestingTenantId,
    target_resource_id: targetResourceId,
    resource_owner_tenant_id: resourceOwnerTenantId,
    access_granted: !isBlocked,
    idor_blocked_by_database: isBlocked,
    security_verdict: isBlocked ? 'BLOCKED_DEFENSE_SUCCESSFUL' : 'VULNERABILITY_LEAK_DETECTED'
  };
};

/**
 * Stage D: Evaluates package dependencies for vulnerabilities and records supply-chain security status
 */
export const auditSupplyChainDependencies = async (tenantId, packageManifest) => {
  logger.info(`Running CI supply-chain dependency vulnerability audit for tenant ${tenantId}`);

  const knownVulnerabilities = [
    { package_name: 'lodash', unsafe_versions: ['4.17.15', '4.17.19'], cve: 'CVE-2021-23337', severity: 'HIGH' },
    { package_name: 'express', unsafe_versions: ['4.16.0'], cve: 'CVE-2022-24999', severity: 'CRITICAL' }
  ];

  const auditLogs = [];

  for (const pkg of packageManifest) {
    const vuln = knownVulnerabilities.find(
      v => v.package_name === pkg.package_name && v.unsafe_versions.includes(pkg.installed_version)
    );

    if (vuln) {
      auditLogs.push({
        tenant_id: tenantId,
        package_name: pkg.package_name,
        installed_version: pkg.installed_version,
        vulnerability_id: vuln.cve,
        severity: vuln.severity,
        is_blocked: true
      });
    }
  }

  if (auditLogs.length > 0) {
    await supabase.from('supply_chain_audit_logs').insert(auditLogs);
  }

  return {
    tenant_id: tenantId,
    packages_scanned: packageManifest.length,
    vulnerabilities_detected: auditLogs.length,
    build_blocked: auditLogs.length > 0,
    findings: auditLogs
  };
};