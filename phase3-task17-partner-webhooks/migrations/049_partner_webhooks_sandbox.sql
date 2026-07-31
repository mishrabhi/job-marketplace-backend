-- 1. PARTNER API KEYS AND QUOTAS TABLE
-- Stores partner API credentials, assigned environment, secret keys, and rate limits[cite: 18]
CREATE TABLE IF NOT EXISTS partner_api_keys (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_name        TEXT NOT NULL,
  tenant_id           UUID NOT NULL,                       -- Strict multi-tenant isolation boundary[cite: 18]
  api_key             TEXT UNIQUE NOT NULL,                -- e.g., 'pk_sandbox_123456789'
  webhook_secret      TEXT NOT NULL,                       -- Used for HMAC-SHA256 signature signing[cite: 18]
  environment         TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox', 'production')),[cite: 18]
  rate_limit_per_min  INTEGER NOT NULL DEFAULT 60,
  requests_count      INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SIGNED WEBHOOK DELIVERY LEDGER
-- Records outgoing webhooks, HMAC signatures, attempt counts, and delivery states[cite: 18]
CREATE TABLE IF NOT EXISTS webhook_dispatch_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id          UUID NOT NULL REFERENCES partner_api_keys(id) ON DELETE CASCADE,
  tenant_id           UUID NOT NULL,                       -- Multi-tenant boundary check[cite: 18]
  target_url          TEXT NOT NULL,
  event_type          TEXT NOT NULL,                       -- e.g., 'ATS_CANDIDATE_EXPORTED'[cite: 18]
  payload             JSONB NOT NULL DEFAULT '{}',
  signature_header    TEXT NOT NULL,                       -- Cryptographic HMAC signature[cite: 18]
  attempts_count      INTEGER NOT NULL DEFAULT 1,
  delivery_status     TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'retrying')),
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Prevents duplicate webhook dispatch[cite: 18]
  dispatched_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempt_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_keys ON partner_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_webhooks_partner ON webhook_dispatch_logs(partner_id, delivery_status);