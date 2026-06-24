-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created',
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT payments_status_check CHECK (status IN ('created','authorized','captured','failed','refunded'))
);

CREATE INDEX IF NOT EXISTS idx_payments_application ON payments(application_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);

-- trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_update_timestamp
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- payment_events table
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON payment_events(payment_id);

-- reconciliation_reports table
CREATE TABLE IF NOT EXISTS reconciliation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date DATE NOT NULL UNIQUE,
  total_orders INTEGER,
  total_captured INTEGER,
  total_failed INTEGER,
  gateway_total_paise BIGINT,
  our_total_paise BIGINT,
  matched BOOLEAN,
  discrepancies JSONB,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
