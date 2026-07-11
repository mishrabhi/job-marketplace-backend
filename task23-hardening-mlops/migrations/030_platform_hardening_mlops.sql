-- 1. MLOPS ACCURACY & AUDIT TRACKING LEDGER
-- Captures feature metrics, pipeline inference tracking, and real operational responses
CREATE TABLE IF NOT EXISTS mlops_inference_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name          TEXT NOT NULL,
  model_version       TEXT NOT NULL,
  student_id          UUID NOT NULL,
  features_payload    JSONB NOT NULL DEFAULT '{}',
  prediction_output   JSONB NOT NULL DEFAULT '{}',
  latency_ms          INTEGER NOT NULL,
  logged_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PRODUCTION LOAD PERFORMANCE SNAPSHOT LOGS
-- Persists metrics from scale testing parameters to track limits
CREATE TABLE IF NOT EXISTS system_load_test_metrics (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_run_token      TEXT NOT NULL,
  concurrent_users    INTEGER NOT NULL,
  requests_per_second NUMERIC(10, 2) NOT NULL,
  error_rate_percent  NUMERIC(5, 2) NOT NULL,
  peak_latency_ms     INTEGER NOT NULL,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mlops_model ON mlops_inference_logs(model_name, model_version);
CREATE INDEX IF NOT EXISTS idx_load_test_token ON system_load_test_metrics(test_run_token);