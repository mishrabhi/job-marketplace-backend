-- 1. ACTIVATION TELEMETRY METRICS TABLE
-- Tracks activation-path success rates and latency across onboarding stages
CREATE TABLE IF NOT EXISTS activation_telemetry_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,                       -- RLS / Tenant boundary isolation
  user_id             UUID NOT NULL,
  activation_stage    TEXT NOT NULL CHECK (activation_stage IN ('signup', 'onboarding_profile', 'first_apply')),
  latency_ms          INTEGER NOT NULL,
  is_success          BOOLEAN NOT NULL DEFAULT true,
  error_code          TEXT,
  idempotency_key     TEXT UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DEFERRED ASYNC ONBOARDING JOBS QUEUE
-- Moves heavy non-critical processing off the primary request path
CREATE TABLE IF NOT EXISTS async_onboarding_jobs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL,
  tenant_id           UUID NOT NULL,
  job_type            TEXT NOT NULL,                       -- e.g., 'GENERATE_WELCOME_KIT', 'INDEX_RESUME_VECTOR'
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payload             JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activation_telemetry_tenant ON activation_telemetry_logs(tenant_id, activation_stage);
CREATE INDEX IF NOT EXISTS idx_async_jobs_status ON async_onboarding_jobs(status);