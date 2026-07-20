-- 1. CONCURRENCY EXECUTIONS AUDIT LEDGER
-- Records parallel request testing executions proving idempotency and data isolation safety
CREATE TABLE IF NOT EXISTS concurrency_test_runs (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_suite_token        TEXT UNIQUE NOT NULL,
  concurrent_call_count   INTEGER NOT NULL,
  successful_commits      INTEGER NOT NULL,
  deduplicated_requests   INTEGER NOT NULL,
  double_charge_prevented BOOLEAN NOT NULL DEFAULT true,
  executed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SPRINT-A SCALE & RELIABILITY SIGN-OFF RECORD
-- Stores permanent evidence sign-offs confirming readiness for production traffic
CREATE TABLE IF NOT EXISTS scale_reliability_signoffs (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_phase            TEXT NOT NULL DEFAULT 'Sprint A - Scale & Reliability',
  signed_off_by           UUID NOT NULL,
  regression_tests_passed BOOLEAN NOT NULL DEFAULT true,
  concurrency_proof_meta  JSONB NOT NULL DEFAULT '{}',
  evidence_notes          TEXT NOT NULL,
  idempotency_key         TEXT UNIQUE NOT NULL,
  signed_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_concurrency_token ON concurrency_test_runs(test_suite_token);