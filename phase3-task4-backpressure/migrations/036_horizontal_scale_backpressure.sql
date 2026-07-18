-- 1. SCALABLE CONCURRENCY LOAD LOGS
CREATE TABLE IF NOT EXISTS platform_load_runs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_token      TEXT UNIQUE NOT NULL,
  traffic_mix_type    TEXT NOT NULL, -- e.g., 'MARKETPLACE_CONCURRENCY_MIX'
  simulated_rps       NUMERIC(10, 2) NOT NULL,
  total_requests      INTEGER NOT NULL,
  executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SYSTEM BREAKING POINT TRACKING REGISTER
CREATE TABLE IF NOT EXISTS system_breaking_points (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_token      TEXT NOT NULL REFERENCES platform_load_runs(test_run_token) ON DELETE CASCADE,
  breaking_point_rps  NUMERIC(10, 2) NOT NULL,
  root_cause_failure  TEXT NOT NULL, -- e.g., 'GATEWAY_TIMEOUT_CASCADING_OUTAGE'
  failed_dependency   TEXT NOT NULL, -- e.g., 'SUPABASE_POOL' or 'GATEWAY_WEBHOOK'
  tenant_id           UUID, -- Strict multi-tenant context tracking protection boundary
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CIRCUIT BREAKER CONTROLLER LIFECYCLE STATES
CREATE TABLE IF NOT EXISTS circuit_breaker_states (
  dependency_name     TEXT PRIMARY KEY,
  current_state       TEXT NOT NULL DEFAULT 'CLOSED' CHECK (current_state IN ('CLOSED', 'OPEN', 'HALF_OPEN')),
  failure_count       INTEGER NOT NULL DEFAULT 0,
  last_tripped_at     TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_breaking_points_token ON system_breaking_points(test_run_token);