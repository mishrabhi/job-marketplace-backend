-- 1. MODEL VERSION PINNING & GOVERNANCE POLICY TABLE
-- Enforces pinned model versions and fallback execution rules
CREATE TABLE IF NOT EXISTS model_governance_policies (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surface_name        TEXT UNIQUE NOT NULL,                -- e.g., 'RECOMMENDATION_FEED', 'SEARCH_RANKER'
  pinned_version      TEXT NOT NULL,                       -- API-enforced pinned model version
  hard_timeout_ms     INTEGER NOT NULL DEFAULT 150,        -- Enforced latency threshold
  fallback_strategy   TEXT NOT NULL CHECK (fallback_strategy IN ('HEURISTIC_SCORE', 'CHRONOLOGICAL', 'FAIL_OPEN_EMPTY')),
  is_governance_active BOOLEAN NOT NULL DEFAULT true,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MODEL GOVERNANCE AUDIT LOG
-- Records every fallback trigger event and contract validation failure
CREATE TABLE IF NOT EXISTS model_fallback_events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surface_name        TEXT NOT NULL REFERENCES model_governance_policies(surface_name) ON DELETE CASCADE,
  tenant_id           UUID NOT NULL,                       -- Multi-tenant isolation boundary
  failure_mode        TEXT NOT NULL CHECK (failure_mode IN ('MODEL_OFF', 'MODEL_SLOW', 'MODEL_WRONG_CONTRACT')),
  latency_ms          INTEGER NOT NULL,
  fallback_used       TEXT NOT NULL,
  triggered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_surface ON model_governance_policies(surface_name);
CREATE INDEX IF NOT EXISTS idx_fallback_tenant ON model_fallback_events(tenant_id);