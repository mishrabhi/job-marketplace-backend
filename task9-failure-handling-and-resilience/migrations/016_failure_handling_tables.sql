-- 1. WEBHOOK RETRY QUEUE
-- Stores webhooks that failed to process so they can be retried.
CREATE TABLE IF NOT EXISTS webhook_retry_queue (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type       TEXT NOT NULL,
  payload          JSONB NOT NULL,
  raw_signature    TEXT NOT NULL,         -- original X-Razorpay-Signature header value
  attempt_count    INTEGER NOT NULL DEFAULT 0,
  max_attempts     INTEGER NOT NULL DEFAULT 5,
  next_retry_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error       TEXT,                  -- error message from last attempt
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'processing', 'succeeded', 'dead')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_retry_queue_status    ON webhook_retry_queue(status);
CREATE INDEX IF NOT EXISTS idx_retry_queue_next_retry ON webhook_retry_queue(next_retry_at)
  WHERE status = 'pending';

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhook_retry_updated_at
  BEFORE UPDATE ON webhook_retry_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. DEAD LETTER QUEUE (DLQ)
-- Webhooks that exhausted all retry attempts.
CREATE TABLE IF NOT EXISTS webhook_dlq (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retry_queue_id   UUID NOT NULL REFERENCES webhook_retry_queue(id),
  event_type       TEXT NOT NULL,
  payload          JSONB NOT NULL,
  total_attempts   INTEGER NOT NULL,
  last_error       TEXT,
  moved_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dlq_event_type ON webhook_dlq(event_type);

-- 3. PAYMENT FAILURE LOG
-- Every payment failure with full context — why it failed and what state it left things in.
CREATE TABLE IF NOT EXISTS payment_failure_log (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id       UUID REFERENCES payments(id),
  failure_type     TEXT NOT NULL,
  error_code       TEXT,
  error_message    TEXT,
  context          JSONB DEFAULT '{}',   -- any extra data (razorpay_order_id, etc.)
  resolved         BOOLEAN NOT NULL DEFAULT false,
  resolved_at      TIMESTAMPTZ,
  resolution_note  TEXT,
  logged_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failure_log_payment   ON payment_failure_log(payment_id);
CREATE INDEX IF NOT EXISTS idx_failure_log_resolved  ON payment_failure_log(resolved);
CREATE INDEX IF NOT EXISTS idx_failure_log_type      ON payment_failure_log(failure_type);