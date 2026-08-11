-- 1. DATA SUBJECT RIGHTS (DSR) REQUEST LEDGER
-- Records DPDP/GDPR Data Subject Requests (Export, Deletion, Correction)[cite: 18]
CREATE TABLE IF NOT EXISTS compliance_dsr_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,                       -- Multi-tenant boundary checking[cite: 18]
  candidate_id        UUID NOT NULL,
  request_type        TEXT NOT NULL CHECK (request_type IN ('ACCESS_EXPORT', 'RIGHT_TO_BE_FORGOTTEN', 'DATA_CORRECTION')),
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_by_email  TEXT NOT NULL,
  completion_receipt  JSONB NOT NULL DEFAULT '{}',
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Concurrency safety[cite: 18]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

-- 2. CASCADING DELETION EVIDENCE AUDIT LOG
-- Immutable evidence trail proving cross-store deletion across database, search, vector, and cache[cite: 18]
CREATE TABLE IF NOT EXISTS compliance_deletion_evidence_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,                       -- Strict tenant isolation[cite: 18]
  candidate_id        UUID NOT NULL,
  dsr_request_id      UUID REFERENCES compliance_dsr_requests(id) ON DELETE CASCADE,
  purged_stores       JSONB NOT NULL DEFAULT '[]',         -- List of purged subsystems e.g., ['DB_STUDENTS', 'SEARCH_INDEX', 'FEATURE_STORE']
  verification_hash   TEXT NOT NULL,                       -- Cryptographic proof of deletion[cite: 18]
  purged_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SOC 2 ACCESS LOG & CONTROL EVIDENCE LEDGER
-- Logs privileged system access and administrative actions for SOC 2 Type II audit trails[cite: 18]
CREATE TABLE IF NOT EXISTS soc2_evidence_audit_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,
  actor_id            UUID NOT NULL,
  action_type         TEXT NOT NULL,                       -- e.g., 'DSR_DELETION_EXECUTED', 'RETENTION_POLICY_RUN'
  resource_targeted   TEXT NOT NULL,
  ip_address          TEXT,
  logged_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dsr_candidate ON compliance_dsr_requests(candidate_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_dsr_status ON compliance_dsr_requests(status);
CREATE INDEX IF NOT EXISTS idx_soc2_tenant ON soc2_evidence_audit_logs(tenant_id);