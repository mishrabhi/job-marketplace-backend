-- PRODUCTION CUTOVER LEDGER AND CHECKLIST LOG
-- Records the final system cutover verification sign-offs and smoke test events
CREATE TABLE IF NOT EXISTS production_cutover_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  environment         TEXT NOT NULL DEFAULT 'production',
  verified_by         UUID NOT NULL,
  checklist_snapshot  JSONB NOT NULL DEFAULT '{}', -- Tracks validation checkboxes
  smoke_tests_passed  BOOLEAN NOT NULL DEFAULT false,
  idempotency_key     TEXT UNIQUE NOT NULL,
  executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cutover_status ON production_cutover_log(smoke_tests_passed);