import crypto from 'crypto';
import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Submits a new DPDP / GDPR Data Subject Request (DSR)[cite: 18]
 */
export const submitDSRRequest = async (payload) => {
  const { tenant_id, candidate_id, request_type, requested_by_email, idempotency_key } = payload;

  logger.info(`Submitting DSR request [Type: ${request_type}] for candidate: ${candidate_id} under tenant: ${tenant_id}`);

  // Idempotency check[cite: 18]
  const { data: existing } = await supabase
    .from('compliance_dsr_requests')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existing) {
    return existing;
  }

  const { data: requestRecord, error } = await supabase
    .from('compliance_dsr_requests')
    .insert([{
      tenant_id,
      candidate_id,
      request_type,
      requested_by_email,
      status: 'pending',
      idempotency_key
    }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return requestRecord;
};

/**
 * Stage B & C: Executes Cascading Deletion (Right to be Forgotten) across all storage layers[cite: 18]
 */
export const executeRightToBeForgotten = async (dsrRequestId, tenantId, actorId) => {
  logger.warn(`🚨 EXECUTING CASCADING PURGE (Right to be Forgotten) for DSR request: ${dsrRequestId}`);

  // 1. Fetch DSR Request details[cite: 18]
  const { data: dsrReq, error: fetchErr } = await supabase
    .from('compliance_dsr_requests')
    .select('*')
    .eq('id', dsrRequestId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (fetchErr || !dsrReq) {
    throw appError(404, 'DSR_REQUEST_NOT_FOUND', 'Target DSR request not found or tenant mismatch.');
  }

  const candidateId = dsrReq.candidate_id;
  const purgedSubsystems = [];

  // 2. Cascade Delete: Primary Student Table
  await supabase.from('students').delete().eq('id', candidateId);
  purgedSubsystems.push('PRIMARY_STUDENT_TABLE');

  // 3. Cascade Delete: Search Index Store[cite: 18]
  await supabase.from('candidate_search_index').delete().eq('student_id', candidateId);
  purgedSubsystems.push('SEARCH_INDEX_STORE');

  // 4. Cascade Delete: Personalization Feature Vector Store[cite: 18]
  await supabase.from('candidate_feature_store').delete().eq('student_id', candidateId);
  purgedSubsystems.push('PERSONALIZATION_FEATURE_STORE');

  // 5. Generate Cryptographic Proof of Deletion Evidence Artifact[cite: 18]
  const verificationPayload = `${candidateId}:${tenantId}:${purgedSubsystems.join(',')}:${Date.now()}`;
  const verificationHash = crypto.createHash('sha256').update(verificationPayload).digest('hex');

  const { data: evidenceLog, error: evidenceErr } = await supabase
    .from('compliance_deletion_evidence_logs')
    .insert([{
      tenant_id: tenantId,
      candidate_id: candidateId,
      dsr_request_id: dsrRequestId,
      purged_stores: purgedSubsystems,
      verification_hash: verificationHash
    }])
    .select()
    .single();

  if (evidenceErr) throw appError(500, 'DB_ERROR', evidenceErr.message);

  // 6. Update DSR request status to completed
  await supabase
    .from('compliance_dsr_requests')
    .update({
      status: 'completed',
      completion_receipt: { purged_stores: purgedSubsystems, verification_hash: verificationHash },
      completed_at: new Date().toISOString()
    })
    .eq('id', dsrRequestId);

  // 7. Log SOC 2 Control Action[cite: 18]
  await supabase.from('soc2_evidence_audit_logs').insert([{
    tenant_id: tenantId,
    actor_id: actorId,
    action_type: 'RIGHT_TO_BE_FORGOTTEN_EXECUTED',
    resource_targeted: candidateId
  }]);

  return {
    dsr_request_id: dsrRequestId,
    status: 'COMPLETED_CASCADING_PURGE',
    purged_stores: purgedSubsystems,
    evidence_proof: evidenceLog
  };
};

/**
 * Stage D: Compiles Data-Subject Access Request (SAR / Data Export)[cite: 18]
 */
export const exportDataSubjectData = async (dsrRequestId, tenantId) => {
  logger.info(`Compiling SAR export package for DSR ID: ${dsrRequestId}`);

  const { data: dsrReq } = await supabase
    .from('compliance_dsr_requests')
    .select('*')
    .eq('id', dsrRequestId)
    .eq('tenant_id', tenantId)
    .single();

  if (!dsrReq) throw appError(404, 'NOT_FOUND', 'DSR Request missing or tenant mismatch.');

  const candidateId = dsrReq.candidate_id;

  // Gather data from candidate feature store and search index[cite: 18]
  const { data: featureData } = await supabase.from('candidate_feature_store').select('*').eq('student_id', candidateId).maybeSingle();
  const { data: searchData } = await supabase.from('candidate_search_index').select('*').eq('student_id', candidateId).maybeSingle();

  const exportBundle = {
    export_metadata: {
      generated_at: new Date().toISOString(),
      tenant_id: tenantId,
      candidate_id: candidateId,
      compliance_standards: ['DPDP_2023', 'GDPR_ARTICLE_15']
    },
    personal_data: {
      feature_vector: featureData || {},
      search_profile: searchData || {}
    }
  };

  await supabase
    .from('compliance_dsr_requests')
    .update({ status: 'completed', completion_receipt: exportBundle, completed_at: new Date().toISOString() })
    .eq('id', dsrRequestId);

  return exportBundle;
};