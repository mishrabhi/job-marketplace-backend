-- 1. Add pending_payment to applications status enum
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending_payment', 'applied', 'shortlisted', 'rejected', 'withdrawn'));

-- 2. Add payment_id FK to applications (nullable — set after capture)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);

-- 3. Add application_fee config table (so fee can change without a code deploy)
CREATE TABLE IF NOT EXISTS application_fee_config (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id      UUID REFERENCES jobs(id),   -- NULL = default for all jobs
  amount_paise INTEGER NOT NULL DEFAULT 10000,  -- ₹100 default
  currency    TEXT NOT NULL DEFAULT 'INR',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default fee row
INSERT INTO application_fee_config (amount_paise, currency, active)
VALUES (10000, 'INR', true)
ON CONFLICT DO NOTHING;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_applications_payment ON applications(payment_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_fee_config_job ON application_fee_config(job_id);
