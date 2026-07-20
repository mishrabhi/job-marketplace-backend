-- 1. TRANSACTIONAL OUTBOX LEDGER
-- Ensures event creation happens atomically inside the primary database transaction[cite: 19]
CREATE TABLE IF NOT EXISTS outbox_events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type          TEXT NOT NULL,               -- e.g., 'APPLICATION_SUBMITTED', 'OFFER_SIGNED'[cite: 19]
  schema_version      TEXT NOT NULL DEFAULT 'v1.0',-- Versioned event schema[cite: 19]
  tenant_id           UUID,                        -- Strict multi-tenant isolation tracking[cite: 19]
  payload             JSONB NOT NULL DEFAULT '{}',
  sequence_number     BIGSERIAL NOT NULL,          -- Guarantees strict ordering during replay[cite: 19]
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  idempotency_key     TEXT UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at        TIMESTAMPTZ
);

-- 2. ANALYTICS INGESTION REPOSITORY
-- Represents downstream analytics storage receiving dispatched outbox events[cite: 19]
CREATE TABLE IF NOT EXISTS analytics_event_store (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outbox_event_id     UUID REFERENCES outbox_events(id) ON DELETE CASCADE,
  event_type          TEXT NOT NULL,
  sequence_number     BIGINT NOT NULL,
  tenant_id           UUID,
  event_payload       JSONB NOT NULL DEFAULT '{}',
  received_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outbox_status_seq ON outbox_events(status, sequence_number ASC);
CREATE INDEX IF NOT EXISTS idx_outbox_tenant ON outbox_events(tenant_id);