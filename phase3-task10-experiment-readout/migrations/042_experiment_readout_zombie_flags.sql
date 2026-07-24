-- 1. EXPERIMENT OUTCOMES LEDGER
-- Records conversion events linked directly to experiment exposures for clean joinable analysis[cite: 19]
CREATE TABLE IF NOT EXISTS experiment_outcomes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key            TEXT NOT NULL REFERENCES feature_flags(flag_key) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  tenant_id           UUID NOT NULL,                       -- Strict multi-tenant isolation checking[cite: 19]
  assigned_variant    TEXT NOT NULL,
  outcome_event_type  TEXT NOT NULL,                       -- e.g., 'APPLICATION_COMPLETED', 'SUBSCRIPTION_PURCHASED'[cite: 19]
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Concurrency & retry safety[cite: 19]
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ZOMBIE FLAG CLEANUP AUDIT LOG
-- Tracks flag removals and deprecation runs to eliminate flag debt[cite: 19]
CREATE TABLE IF NOT EXISTS flag_cleanup_audit_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key            TEXT NOT NULL,
  cleanup_reason      TEXT NOT NULL CHECK (cleanup_reason IN ('EXPIRED', 'INACTIVE_ABANDONED', 'MANUAL_DEPRECATION')),
  performed_by        UUID NOT NULL,
  archived_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outcomes_flag_variant ON experiment_outcomes(flag_key, assigned_variant);
CREATE INDEX IF NOT EXISTS idx_outcomes_tenant ON experiment_outcomes(tenant_id);