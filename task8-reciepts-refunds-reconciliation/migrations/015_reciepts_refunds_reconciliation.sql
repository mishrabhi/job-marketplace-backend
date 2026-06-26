-- Migration 015: Receipts, Refunds & Reconciliation
-- Depends on: payments table (Task 6), applications table (Tasks 4 & 7)

-- ─────────────────────────────────────────
-- 1. RECEIPTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS receipts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id          UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  student_id          UUID NOT NULL REFERENCES students(id),
  receipt_number      TEXT NOT NULL UNIQUE,   -- human-readable: RCP-2024-000001
  amount_paise        INTEGER NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url             TEXT,                   -- optional: link to generated PDF receipt
  metadata            JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_receipts_payment    ON receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_student    ON receipts(student_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number     ON receipts(receipt_number);

-- Sequence for receipt number generation
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 1;

-- ─────────────────────────────────────────
-- 2. REFUNDS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refunds (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id            UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  student_id            UUID NOT NULL REFERENCES students(id),
  amount_paise          INTEGER NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'INR',
  reason                TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'initiated'
                        CHECK (status IN ('initiated', 'processed', 'failed')),
  razorpay_refund_id    TEXT UNIQUE,          -- set when Razorpay processes the refund
  idempotency_key       TEXT NOT NULL UNIQUE, -- prevent double refunds
  failure_reason        TEXT,
  initiated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at          TIMESTAMPTZ,
  metadata              JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment     ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_student     ON refunds(student_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status      ON refunds(status);

-- ─────────────────────────────────────────
-- 3. RECONCILIATION REPORTS
-- Upserted daily — one row per date
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reconciliation_reports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_date           DATE NOT NULL UNIQUE,
  -- Our DB counts
  total_orders          INTEGER NOT NULL DEFAULT 0,
  total_captured        INTEGER NOT NULL DEFAULT 0,
  total_failed          INTEGER NOT NULL DEFAULT 0,
  total_refunded        INTEGER NOT NULL DEFAULT 0,
  -- Amounts in paise
  our_captured_paise    BIGINT NOT NULL DEFAULT 0,
  our_refunded_paise    BIGINT NOT NULL DEFAULT 0,
  our_net_paise         BIGINT NOT NULL DEFAULT 0,  -- captured - refunded
  -- Gateway amounts (from Razorpay API)
  gateway_captured_paise BIGINT NOT NULL DEFAULT 0,
  gateway_refunded_paise BIGINT NOT NULL DEFAULT 0,
  -- Match result
  matched               BOOLEAN NOT NULL DEFAULT false,
  discrepancies         JSONB DEFAULT '[]',  -- list of mismatched payment IDs
  -- Meta
  generated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes                 TEXT
);

CREATE INDEX IF NOT EXISTS idx_recon_date ON reconciliation_reports(report_date);