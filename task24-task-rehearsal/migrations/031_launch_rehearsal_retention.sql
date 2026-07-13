-- 1. LAUNCH BUG BASH & BLOCKER TRACKING LEDGER
-- Dynamically documents verified pen-test anomalies and bug bash blocker resolutions
CREATE TABLE IF NOT EXISTS launch_blockers_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_context   TEXT NOT NULL, -- e.g., 'PAYMENTS_WEBHOOK', 'TENANT_ISOLATION'
  severity_level      TEXT NOT NULL CHECK (severity_level IN ('low', 'medium', 'critical_blocker')),
  description         TEXT NOT NULL,
  is_cleared          BOOLEAN NOT NULL DEFAULT false,
  cleared_at          TIMESTAMPTZ,
  resolved_notes      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DATA RETENTION POLICY RUN LEDGER
-- Records and tracks automated structural data retention pruning executions
CREATE TABLE IF NOT EXISTS data_retention_runs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_applied      TEXT NOT NULL, -- e.g., 'PRUNE_EXPIRED_DRAFT_OFFERS', 'PURGE_SANDBOX_LOGS'
  records_affected    INTEGER NOT NULL,
  executed_by         UUID NOT NULL,
  executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blockers_severity ON launch_blockers_log(severity_level) WHERE is_cleared = false;