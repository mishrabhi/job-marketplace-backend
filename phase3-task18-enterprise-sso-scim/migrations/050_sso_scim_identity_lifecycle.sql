-- 1. ENTERPRISE SSO PROVIDER CONFIGURATIONS
-- Stores SAML/OIDC IdP metadata configurations per tenant[cite: 18]
CREATE TABLE IF NOT EXISTS tenant_sso_configs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID UNIQUE NOT NULL,                -- Multi-tenant isolation boundary[cite: 18]
  idp_entity_id       TEXT NOT NULL,                       -- SAML EntityID / OIDC Issuer
  sso_login_url       TEXT NOT NULL,
  certificate_fingerprint TEXT NOT NULL,
  protocol            TEXT NOT NULL DEFAULT 'SAML2' CHECK (protocol IN ('SAML2', 'OIDC')),
  allow_break_glass   BOOLEAN NOT NULL DEFAULT true,      -- Emergency local admin fallback flag[cite: 18]
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SCIM USER PROVISIONING LEDGER & LIFECYCLE STATE
-- Tracks SCIM provisioning states, external IdP IDs, and active session status[cite: 18]
CREATE TABLE IF NOT EXISTS scim_provisioned_identities (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_idp_id     TEXT UNIQUE NOT NULL,                -- IdP primary user key
  tenant_id           UUID NOT NULL,                       -- Tenant boundary isolation[cite: 18]
  email               TEXT NOT NULL,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  user_status         TEXT NOT NULL DEFAULT 'active' CHECK (user_status IN ('active', 'suspended', 'deprovisioned')),[cite: 18]
  active_session_token TEXT,                               -- Active session token for instant revocation[cite: 18]
  revoked_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SCIM BEARER TOKEN AUTHENTICATION LEDGER
CREATE TABLE IF NOT EXISTS scim_bearer_tokens (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL REFERENCES tenant_sso_configs(tenant_id) ON DELETE CASCADE,
  scim_token          TEXT UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scim_external ON scim_provisioned_identities(external_idp_id);
CREATE INDEX IF NOT EXISTS idx_scim_tenant_status ON scim_provisioned_identities(tenant_id, user_status);