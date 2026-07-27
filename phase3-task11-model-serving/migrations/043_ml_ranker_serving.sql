-- 1. MODEL DEPLOYMENT & CANARY STATE CONFIGURATION
-- Tracks active ranker models, traffic weights, and canary deployment status[cite: 19]
CREATE TABLE IF NOT EXISTS ranker_model_deployments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_version       TEXT UNIQUE NOT NULL,                  -- e.g., 'ltr_v2.1_xgboost'[cite: 19]
  deployment_mode     TEXT NOT NULL DEFAULT 'shadow' CHECK (deployment_mode IN ('shadow', 'canary', 'primary', 'disabled')),[cite: 19]
  canary_traffic_pct  INTEGER NOT NULL DEFAULT 0 CHECK (canary_traffic_pct BETWEEN 0 AND 100),[cite: 19]
  max_allowed_latency INTEGER NOT NULL DEFAULT 150,           -- Latency budget bound in ms[cite: 19]
  max_error_rate_pct  NUMERIC(5, 2) NOT NULL DEFAULT 5.00,  -- Guardrail error threshold[cite: 19]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SHADOW & CANARY RANKING LOGS
-- Logs primary vs shadow scores for comparative evaluation without user harm[cite: 19]
CREATE TABLE IF NOT EXISTS ranker_inference_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          TEXT NOT NULL,
  tenant_id           UUID NOT NULL,                         -- Strict multi-tenant context boundary[cite: 19]
  student_id          UUID NOT NULL,
  primary_model_ver   TEXT NOT NULL,
  primary_scores      JSONB NOT NULL DEFAULT '[]',
  shadow_model_ver    TEXT,
  shadow_scores       JSONB DEFAULT '[]',                    -- Scored, not shown to user[cite: 19]
  served_model_ver    TEXT NOT NULL,
  inference_latency_ms INTEGER NOT NULL,
  guardrail_breached  BOOLEAN NOT NULL DEFAULT false,        -- Identifies latency/error breaches[cite: 19]
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ranker_logs_tenant ON ranker_inference_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ranker_logs_model ON ranker_inference_logs(served_model_ver);