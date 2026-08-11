-- 1. DATABASE BACKUP SNAPSHOTS LEDGER
-- Records full and incremental database backup snapshots with cryptographic verification hashes[cite: 19]
CREATE TABLE IF NOT EXISTS dr_backup_snapshots (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,                       -- Multi-tenant boundary isolation[cite: 19]
  snapshot_identifier TEXT UNIQUE NOT NULL,                -- e.g., 'snap_full_20260811_001'
  snapshot_type       TEXT NOT NULL DEFAULT 'FULL' CHECK (snapshot_type IN ('FULL', 'INCREMENTAL')),
  storage_location    TEXT NOT NULL,                       -- S3 / Cold Storage URI
  size_bytes          BIGINT NOT NULL,
  checksum_sha256     TEXT NOT NULL,                       -- Cryptographic verification checksum[cite: 19]
  is_valid            BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RESTORE DRILL EXECUTION & RTO/RPO MEASUREMENT LEDGER
-- Tracks backup restore drills, target environment validation, and SLA compliance[cite: 19]
CREATE TABLE IF NOT EXISTS dr_restore_drills (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,                       -- Strict tenant isolation[cite: 19]
  snapshot_id         UUID NOT NULL REFERENCES dr_backup_snapshots(id) ON DELETE CASCADE,
  target_environment  TEXT NOT NULL DEFAULT 'dr_sandbox',
  rto_measured_seconds NUMERIC(8, 2) NOT NULL,            -- Measured Recovery Time Objective[cite: 19]
  rpo_measured_seconds NUMERIC(8, 2) NOT NULL,            -- Measured Recovery Point Objective[cite: 19]
  rto_target_seconds  INTEGER NOT NULL DEFAULT 300,        -- SLA target (5 mins)
  rpo_target_seconds  INTEGER NOT NULL DEFAULT 60,         -- SLA target (1 min)
  drill_status        TEXT NOT NULL DEFAULT 'completed' CHECK (drill_status IN ('in_progress', 'completed', 'failed')),
  verification_passed BOOLEAN NOT NULL DEFAULT true,
  executed_by         UUID NOT NULL,
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Concurrency safety[cite: 19]
  executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. CHAOS TESTING & SIMULATION LOGS
-- Records simulated system failures and failover recovery proofs[cite: 19]
CREATE TABLE IF NOT EXISTS dr_chaos_simulations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,
  scenario_type       TEXT NOT NULL CHECK (scenario_type IN ('DB_FAILOVER', 'REGION_OUTAGE', 'NETWORK_PARTITION', 'DEPENDENCY_TIMEOUT')),
  degraded_component TEXT NOT NULL,
  fallback_engaged    TEXT NOT NULL,
  recovery_time_ms    INTEGER NOT NULL,
  passed_failover_test BOOLEAN NOT NULL DEFAULT true,
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Retry safety[cite: 19]
  simulated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dr_snapshot_tenant ON dr_backup_snapshots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dr_restore_tenant ON dr_restore_drills(tenant_id, drill_status);
CREATE INDEX IF NOT EXISTS idx_dr_chaos_tenant ON dr_chaos_simulations(tenant_id);