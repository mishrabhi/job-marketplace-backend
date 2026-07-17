-- 1. DISTRIBUTED TRACING TELEMETRY LEDGER
CREATE TABLE IF NOT EXISTS telemetry_traces (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trace_id            TEXT NOT NULL,
  span_id             TEXT NOT NULL,
  parent_span_id      TEXT,
  endpoint_path       TEXT NOT NULL,
  http_method         TEXT NOT NULL,
  latency_ms          INTEGER NOT NULL,
  status_code         INTEGER NOT NULL,
  tenant_id           UUID, -- Strict multi-tenant context monitoring boundary
  meta_attributes     JSONB NOT NULL DEFAULT '{}',
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SLO AND ERROR BUDGET THRESHOLDS PROFILE
CREATE TABLE IF NOT EXISTS endpoint_slo_profiles (
  endpoint_path       TEXT PRIMARY KEY,
  target_latency_ms   INTEGER NOT NULL,      -- Latency target bound (e.g., 200ms)
  availability_target NUMERIC(5,2) NOT NULL, -- Availability target (e.g., 99.50%)
  total_budget_tokens INTEGER NOT NULL,      -- Initial allowance tokens per window
  spent_budget_tokens INTEGER NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. OBSERVABILITY INCIDENT ALERT RUN BUCKET
CREATE TABLE IF NOT EXISTS slo_alerts_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint_path       TEXT NOT NULL REFERENCES endpoint_slo_profiles(endpoint_path),
  violation_type      TEXT NOT NULL CHECK (violation_type IN ('LATENCY_EXCEEDED', 'ERROR_BUDGET_EXHAUSTED')),
  incident_details    JSONB NOT NULL DEFAULT '{}',
  is_acknowledged     BOOLEAN NOT NULL DEFAULT false,
  triggered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_traces_id ON telemetry_traces(trace_id);
CREATE INDEX IF NOT EXISTS idx_traces_endpoint ON telemetry_traces(endpoint_path);