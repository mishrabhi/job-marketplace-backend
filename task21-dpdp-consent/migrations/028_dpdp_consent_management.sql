-- 1. GRANULAR CONSENT REGISTRY
CREATE TABLE IF NOT EXISTS dpdp_consent_registry (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL,
  consent_type        TEXT NOT NULL CHECK (consent_type IN ('profile_sharing', 'placement_analytics', 'proctoring_logs')),
  is_granted          BOOLEAN NOT NULL DEFAULT true,
  ip_address          TEXT NOT NULL,
  user_agent          TEXT NOT NULL,
  idempotency_key     TEXT UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. IMMUTABLE CONSENT AUDIT LOGS
CREATE TABLE IF NOT EXISTS dpdp_consent_audit_trail (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL,
  action_type         TEXT NOT NULL CHECK (action_type IN ('GRANT', 'WITHDRAW', 'DATA_PURGE')),
  consent_type        TEXT,
  details_snapshot    JSONB NOT NULL DEFAULT '{}',
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dpdp_consent_lookup ON dpdp_consent_registry(user_id, consent_type);