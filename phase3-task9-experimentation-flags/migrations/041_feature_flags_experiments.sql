-- 1. FEATURE FLAGS & EXPERIMENTS CONFIGURATION TABLE
-- Defines flags, rollouts, variant weightings, and kill switch toggles[cite: 19]
CREATE TABLE IF NOT EXISTS feature_flags (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key            TEXT UNIQUE NOT NULL,                -- e.g., 'NEW_RECOMMENDATION_ENGINE'[cite: 19]
  description         TEXT NOT NULL,
  is_active           BOOLEAN NOT NULL DEFAULT true,       -- Primary Kill Switch toggle[cite: 19]
  variants            JSONB NOT NULL DEFAULT '["control", "treatment"]', -- Supported variants[cite: 19]
  traffic_allocation  INTEGER NOT NULL DEFAULT 100 CHECK (traffic_allocation BETWEEN 0 AND 100),
  owner_email         TEXT NOT NULL,                        -- Governance: Mandatory owner[cite: 19]
  expires_at          TIMESTAMPTZ,                          -- Governance: Flag expiration date[cite: 19]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SERVER-SIDE VARIANT EXPOSURE LOGS
-- Audit table recording user exposures for analysis[cite: 19]
CREATE TABLE IF NOT EXISTS experiment_exposures (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key            TEXT NOT NULL REFERENCES feature_flags(flag_key) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  tenant_id           UUID NOT NULL,                        -- Strict multi-tenant context tracking[cite: 19]
  assigned_variant    TEXT NOT NULL,
  evaluated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_exposures_flag_user ON experiment_exposures(flag_key, user_id);