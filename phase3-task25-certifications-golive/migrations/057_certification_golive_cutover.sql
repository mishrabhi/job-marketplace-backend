-- 1. PHASE 3 CERTIFICATION PACK LEDGER
CREATE TABLE IF NOT EXISTS phase3_certification_packs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,
  certification_version TEXT NOT NULL DEFAULT 'v2.0.0',
  slo_status          TEXT NOT NULL CHECK (slo_status IN ('PASSED', 'FAILED')),
  load_test_passed    BOOLEAN NOT NULL DEFAULT true,
  security_audit_clear BOOLEAN NOT NULL DEFAULT true,
  compliance_verified BOOLEAN NOT NULL DEFAULT true,
  dr_restore_proven   BOOLEAN NOT NULL DEFAULT true,
  finops_target_met   BOOLEAN NOT NULL DEFAULT true,
  certified_by        UUID NOT NULL,
  idempotency_key     TEXT UNIQUE NOT NULL,
  certified_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. STAGED PRODUCTION CUTOVER LEDGER
CREATE TABLE IF NOT EXISTS staged_cutover_executions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,
  stage_name          TEXT NOT NULL,
  canary_traffic_pct  INTEGER NOT NULL CHECK (canary_traffic_pct BETWEEN 0 AND 100),
  cutover_status      TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (cutover_status IN ('IN_PROGRESS', 'SUCCESSFUL', 'ROLLED_BACK')),
  error_rate_pct      NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  rollback_reason     TEXT,
  idempotency_key     TEXT UNIQUE NOT NULL,
  executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. POST-LAUNCH HEALTH & PHASE-4 BACKLOG REGISTRY
CREATE TABLE IF NOT EXISTS post_launch_health_backlog (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,
  report_type         TEXT NOT NULL CHECK (report_type IN ('POST_LAUNCH_HEALTH', 'PHASE_4_BACKLOG')),
  item_title          TEXT NOT NULL,
  severity_priority   TEXT NOT NULL CHECK (severity_priority IN ('P0', 'P1', 'P2', 'P3')),
  details             JSONB NOT NULL DEFAULT '{}',
  logged_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_tenant ON phase3_certification_packs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cutover_tenant ON staged_cutover_executions(tenant_id, cutover_status);
CREATE INDEX IF NOT EXISTS idx_health_backlog ON post_launch_health_backlog(tenant_id);