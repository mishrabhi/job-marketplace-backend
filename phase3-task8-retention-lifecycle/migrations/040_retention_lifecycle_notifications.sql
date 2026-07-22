-- 1. USER ENGAGEMENT LIFECYCLE STATE TABLE
-- Tracks user engagement lifecycle states and last activity timestamps[cite: 19]
CREATE TABLE IF NOT EXISTS user_lifecycle_states (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE,
  tenant_id           UUID NOT NULL,                       -- Tenant context isolation boundary[cite: 19]
  lifecycle_state     TEXT NOT NULL DEFAULT 'active' CHECK (lifecycle_state IN ('active', 'at_risk', 'dormant', 'churned')),
  last_active_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. NOTIFICATION DISPATCH LEDGER
-- Records re-engagement dispatches with idempotency and DPDP consent compliance[cite: 19]
CREATE TABLE IF NOT EXISTS notification_dispatches (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL,
  tenant_id           UUID NOT NULL,                       -- Strict multi-tenant verification[cite: 19]
  notification_type   TEXT NOT NULL,                       -- e.g., 'RE_ENGAGEMENT_NUDGE', 'NEW_OFFER_ALERT'
  channel             TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  consent_verified    BOOLEAN NOT NULL DEFAULT false,     -- Must be verified true prior to dispatch[cite: 19]
  dispatch_status     TEXT NOT NULL DEFAULT 'dispatched' CHECK (dispatch_status IN ('dispatched', 'blocked_no_consent', 'failed')),
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Prevents duplicate sends[cite: 19]
  dispatched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_user_tenant ON user_lifecycle_states(user_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_notification_idempotency ON notification_dispatches(idempotency_key);