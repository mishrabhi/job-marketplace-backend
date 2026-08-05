-- 1. STRIDE THREAT MODEL REGISTRY
-- Records threat modeling findings, STRIDE classifications, and mitigation statuses[cite: 16]
CREATE TABLE IF NOT EXISTS stride_threat_models (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,                       -- Multi-tenant isolation boundary[cite: 16]
  surface_name        TEXT NOT NULL,                       -- e.g., 'CANDIDATE_DOSSIERS_API'
  stride_category     TEXT NOT NULL CHECK (stride_category IN ('SPOOFING', 'TAMPERING', 'REPUDIATION', 'INFO_DISCLOSURE', 'DENIAL_OF_SERVICE', 'ELEVATION_OF_PRIVILEGE')),
  vulnerability_title TEXT NOT NULL,
  severity            TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  remediation_status  TEXT NOT NULL DEFAULT 'open' CHECK (remediation_status IN ('open', 'mitigated', 'resolved')),
  mitigation_details  TEXT NOT NULL,
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Retry safety[cite: 16]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DEPENDENCY / SUPPLY-CHAIN VULNERABILITY AUDIT LEDGER
-- Records supply-chain security scanning results[cite: 16]
CREATE TABLE IF NOT EXISTS supply_chain_audit_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,
  package_name        TEXT NOT NULL,
  installed_version   TEXT NOT NULL,
  vulnerability_id    TEXT NOT NULL,                       -- e.g., 'CVE-2026-3391'
  severity            TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  is_blocked          BOOLEAN NOT NULL DEFAULT true,
  scanned_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stride_tenant ON stride_threat_models(tenant_id, remediation_status);
CREATE INDEX IF NOT EXISTS idx_supply_chain_tenant ON supply_chain_audit_logs(tenant_id);