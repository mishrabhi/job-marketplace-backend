-- 1. ORGANIZATIONS / TENANTS MATRIX
CREATE TABLE IF NOT EXISTS enterprise_tenants (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_name         TEXT NOT NULL,
  domain_identifier   TEXT UNIQUE NOT NULL,               -- e.g., 'stanford.edu', 'mit.edu'
  tier                TEXT NOT NULL DEFAULT 'enterprise' CHECK (tier IN ('standard', 'enterprise')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ROLES & PERMISSIONS LEDGER
CREATE TABLE IF NOT EXISTS rbac_roles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name           TEXT UNIQUE NOT NULL,               -- e.g., 'TENANT_ADMIN', 'RECRUITER', 'STUDENT'
  permissions         JSONB NOT NULL DEFAULT '[]',        -- Granted granular permission strings
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. USER TENANT MEMBERSHIP
CREATE TABLE IF NOT EXISTS tenant_user_memberships (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL,
  tenant_id           UUID NOT NULL REFERENCES enterprise_tenants(id) ON DELETE CASCADE,
  role_name           TEXT NOT NULL REFERENCES rbac_roles(role_name) ON DELETE CASCADE,
  UNIQUE(user_id, tenant_id)
);

-- 4. TENANT-PROTECTED ENTERPRISE DATA TABLE
CREATE TABLE IF NOT EXISTS enterprise_candidate_dossiers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES enterprise_tenants(id) ON DELETE CASCADE,
  candidate_id        UUID NOT NULL,
  confidential_notes  TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ROW-LEVEL SECURITY (RLS) ENFORCEMENT AT DATABASE LAYER
ALTER TABLE enterprise_candidate_dossiers ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Policy reading current transaction's tenant context settings
CREATE POLICY tenant_isolation_policy ON enterprise_candidate_dossiers
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

CREATE INDEX IF NOT EXISTS idx_dossiers_tenant ON enterprise_candidate_dossiers(tenant_id);