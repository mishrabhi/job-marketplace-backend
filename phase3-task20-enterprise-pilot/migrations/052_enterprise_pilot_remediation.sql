-- 1. ENTERPRISE PILOT TENANT PROVISIONING REGISTRY
-- Tracks fully provisioned pilot enterprise tenants
CREATE TABLE IF NOT EXISTS pilot_tenant_registrations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID UNIQUE NOT NULL,                -- Multi-tenant isolation boundary
  pilot_name          TEXT NOT NULL,
  sso_enabled         BOOLEAN NOT NULL DEFAULT true,
  scim_enabled        BOOLEAN NOT NULL DEFAULT true,
  ats_partner_key     TEXT NOT NULL,
  provisioned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PILOT REMEDIATION REGISTER
-- Stores audit gaps, severity levels, and remediation action items prior to go-live
CREATE TABLE IF NOT EXISTS pilot_remediation_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES pilot_tenant_registrations(tenant_id) ON DELETE CASCADE,
  gap_title           TEXT NOT NULL,
  severity            TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  category            TEXT NOT NULL,                       -- e.g., 'SECURITY', 'PERFORMANCE', 'INTEGRATION'
  remediation_status  TEXT NOT NULL DEFAULT 'open' CHECK (remediation_status IN ('open', 'in_progress', 'resolved')),
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Deduplication and retry safety
  logged_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pilot_tenant ON pilot_tenant_registrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_remediation_tenant ON pilot_remediation_items(tenant_id, remediation_status);