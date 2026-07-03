-- Seed structural configurations to test transaction lifecycles under Task 15 simulation 
CREATE TABLE IF NOT EXISTS platform_dry_run_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token   TEXT NOT NULL,
  execution_step  TEXT NOT NULL,
  payload_snapshot JSONB NOT NULL DEFAULT '{}',
  is_successful   BOOLEAN NOT NULL DEFAULT true,
  executed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dry_run_session ON platform_dry_run_logs(session_token);