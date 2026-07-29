-- 1. IMMUTABLE DECISION AUDIT LOG TABLE
-- Append-only ledger recording automated candidate decisions, model versions, and feature weights[cite: 18]
CREATE TABLE IF NOT EXISTS decision_audit_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_token      TEXT UNIQUE NOT NULL,                -- External reference token for candidate explanations[cite: 18]
  tenant_id           UUID NOT NULL,                       -- Strict multi-tenant isolation checking[cite: 18]
  candidate_id        UUID NOT NULL,
  application_id      UUID NOT NULL,
  model_version       TEXT NOT NULL,                       -- Exact model version used[cite: 18]
  decision_type       TEXT NOT NULL CHECK (decision_type IN ('RANKED', 'SHORTLISTED', 'REJECTED')),
  decision_reason     TEXT NOT NULL,                       -- Human-readable summary
  feature_weights     JSONB NOT NULL DEFAULT '{}',         -- Feature importance scores for explainability[cite: 18]
  input_snapshot      JSONB NOT NULL DEFAULT '{}',         -- Reproducibility: Snapshot of candidate input features[cite: 18]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. HUMAN-REVIEW / APPEAL WORKFLOW TABLE
-- Stores candidate appeals and human reviewer determinations[cite: 18]
CREATE TABLE IF NOT EXISTS candidate_decision_appeals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  decision_token      TEXT NOT NULL REFERENCES decision_audit_logs(decision_token) ON DELETE CASCADE,
  candidate_id        UUID NOT NULL,
  tenant_id           UUID NOT NULL,                       -- Multi-tenant boundary check[cite: 18]
  appeal_reason       TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'overturned', 'upheld')),
  reviewer_notes      TEXT,
  reviewed_by         UUID,
  reviewed_at         TIMESTAMPTZ,
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Retries and deduplication safety[cite: 18]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_token ON decision_audit_logs(decision_token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON decision_audit_logs(tenant_id, candidate_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON candidate_decision_appeals(status);