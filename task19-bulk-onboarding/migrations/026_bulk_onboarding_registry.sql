-- 1. TRACK BULK IMPORT BATCH OPERATIONS
CREATE TABLE IF NOT EXISTS bulk_onboarding_batches (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id          UUID NOT NULL REFERENCES platform_colleges(id) ON DELETE CASCADE,
  processed_by        UUID NOT NULL,
  total_records       INTEGER NOT NULL DEFAULT 0,
  successful_records  INTEGER NOT NULL DEFAULT 0,
  failed_records      INTEGER NOT NULL DEFAULT 0,
  error_log_summary   JSONB DEFAULT '[]', -- Contains line-by-line parsing errors
  idempotency_key     TEXT UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_batches_college ON bulk_onboarding_batches(college_id);