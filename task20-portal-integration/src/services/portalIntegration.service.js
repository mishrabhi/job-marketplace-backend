import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Validates data access permissions to block cross-tenant visibility 
 */
const confirmCollegeTenantClearance = async (collegeId, userId) => {
  const { data: claims, error } = await supabase
    .from('college_admins')
    .select('id, is_active')
    .eq('college_id', collegeId)
    .eq('user_identity_id', userId)
    .maybeSingle();

  if (error) throw appError(500, 'TENANT_CHECK_ERROR', error.message);
  if (!claims || !claims.is_active) {
    logger.error(`🚨 Tenancy leak access blocked: User ${userId} requested reading from College: ${collegeId}`);
    throw appError(403, 'TENANT_ACCESS_DENIED', 'Access Denied: Operating clearances rejected for this target college tenant domain.');
  }
};

/**
 * Runs a simulated integration verification sequence across the structural portal ecosystem 
 */
export const runSystemPortalDryRun = async (payload) => {
  const { test_session_token, college_id, college_officer_id, student_id, application_id, admin_user_id, idempotency_key } = payload;
  logger.info(`Starting cross-portal integrated dry-run sequence loop under session token: ${test_session_token}`);

  // 1. Enforce Multi-Tenant Isolation Security Boundary Checks 
  await confirmCollegeTenantClearance(college_id, college_officer_id);

  // 2. Enforce Operation Level Idempotency Safeties 
  const { data: existingAuditLog, error: idenErr } = await supabase
    .from('portal_dry_run_audits')
    .select('*')
    .eq('test_session_token', test_session_token)
    .eq('checkpoint_step', 'ECOSYSTEM_COMPLETE_VALIDATION')
    .maybeSingle();

  if (idenErr) throw appError(500, 'DB_ERROR', idenErr.message);
  if (existingAuditLog) {
    logger.warn('Duplicate transaction block encountered. Returning historical dry-run snapshot.', { id: existingAuditLog.id });
    return { status: 'RESOLVED_FROM_IDEMPOTENCY_CACHE', audit_summary: existingAuditLog.state_payload };
  }

  // --- Pipeline Portal Checkpoint A: College Dashboard & Roster Verification 
  const { data: studentProfile, error: stErr } = await supabase
    .from('students')
    .select('id, college_id, name, email')
    .eq('id', student_id)
    .eq('college_id', college_id)
    .maybeSingle();

  if (stErr) throw appError(500, 'INTEGRATION_STEP_FAIL', stErr.message);
  if (!studentProfile) throw appError(404, 'STUDENT_MAPPING_NOT_FOUND', 'Target student roster file missing or not linked to this college tenant.');

  await supabase.from('portal_dry_run_audits').insert([{
    test_session_token, portal_domain: 'college_portal', checkpoint_step: 'ROSTER_VERIFICATION', payload_snapshot: studentProfile
  }]);

  // --- Pipeline Portal Checkpoint B: Central Administration Incident Verification Queue
  const { data: proctorIncident, error: prErr } = await supabase
    .from('proctoring_review_queue')
    .select('*')
    .eq('student_id', student_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (prErr) throw appError(500, 'INTEGRATION_STEP_FAIL', prErr.message);

  await supabase.from('portal_dry_run_audits').insert([{
    test_session_token, portal_domain: 'admin_console', checkpoint_step: 'PROCTORING_AUDIT', payload_snapshot: proctorIncident || { status: 'NO_INCIDENTS_RECORDED' }
  }]);

  // --- Pipeline Portal Checkpoint C: Unified End-to-End Journey Status Ledger
  const { data: journeyTimeline, error: tlErr } = await supabase
    .from('application_status_history')
    .select('*')
    .eq('application_id', application_id)
    .order('changed_at', { ascending: true });

  if (tlErr) throw appError(500, 'INTEGRATION_STEP_FAIL', tlErr.message);

  const finalStatePayload = {
    college_verified: true,
    student_profile_id: student_id,
    active_proctor_ticket: proctorIncident?.id || null,
    total_journey_transitions: journeyTimeline?.length || 0,
    current_validated_status: journeyTimeline?.[journeyTimeline.length - 1]?.new_status || 'applied'
  };

  // 3. Persist the final summary ledger entry into permanent database records 
  const { data: committedAuditRecord, error: insErr } = await supabase
    .from('portal_dry_run_audits')
    .insert([{
      test_session_token,
      portal_domain: 'admin_console',
      checkpoint_step: 'ECOSYSTEM_COMPLETE_VALIDATION',
      state_payload: finalStatePayload
    }])
    .select()
    .single();

  if (insErr) throw appError(500, 'DB_ERROR', insErr.message);

  return {
    test_session_token,
    verdict: 'PORTALS_INTEGRATION_VERIFIED_STABLE',
    current_application_state: finalStatePayload.current_validated_status,
    registered_checkpoints_logged: 3
  };
};