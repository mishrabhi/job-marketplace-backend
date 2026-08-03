-- 1. TENANT WHITE-LABEL & OPERATIONAL CONFIGURATIONS
-- Stores branding, thresholds, and system limits per enterprise tenant
CREATE TABLE IF NOT EXISTS tenant_configurations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID UNIQUE NOT NULL,                -- Multi-tenant isolation boundary
  primary_color_hex   TEXT NOT NULL DEFAULT '#1E40AF',     -- White-label branding color
  company_logo_url    TEXT NOT NULL,                       -- White-label branding logo
  custom_domain       TEXT,                                -- Optional white-label domain
  max_concurrent_jobs INTEGER NOT NULL DEFAULT 50,         -- Operational limit threshold
  rate_limit_per_min  INTEGER NOT NULL DEFAULT 300,        -- Rate limiting quota
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AUDITED ADMIN ACTION LOG WITH STATE SNAPSHOTS FOR ROLLBACK
-- Append-only audit ledger recording every configuration modification
CREATE TABLE IF NOT EXISTS admin_action_audit_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenant_configurations(tenant_id) ON DELETE CASCADE,
  action_type         TEXT NOT NULL,                       -- e.g., 'CONFIG_UPDATE', 'CONFIG_ROLLBACK'
  performed_by        UUID NOT NULL,                       -- Admin executor UUID
  previous_snapshot   JSONB NOT NULL DEFAULT '{}',         -- Snapshot for atomic rollback
  new_snapshot        JSONB NOT NULL DEFAULT '{}',         -- Applied state snapshot
  reason_notes        TEXT NOT NULL,                       -- Mandatory justification
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Deduplication and retry safety
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_config ON tenant_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_tenant ON admin_action_audit_logs(tenant_id);