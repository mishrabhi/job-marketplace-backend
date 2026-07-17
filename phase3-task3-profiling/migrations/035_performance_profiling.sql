-- 1. QUERY PERFORMANCE AND BOTTLENECK PROFILE LEDGER
CREATE TABLE IF NOT EXISTS query_performance_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint_path       TEXT NOT NULL,
  query_raw_string    TEXT NOT NULL,
  execution_time_ms   NUMERIC(10, 2) NOT NULL,
  is_n_plus_one       BOOLEAN NOT NULL DEFAULT false,
  tenant_id           UUID, -- Explicit multi-tenant context tracking protection boundary
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. LATENCY METRICS VERIFICATION PROFILE
CREATE TABLE IF NOT EXISTS latency_benchmarks_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint_path       TEXT UNIQUE NOT NULL,
  p95_latency_before  NUMERIC(10, 2) NOT NULL,
  p95_latency_after   NUMERIC(10, 2) NOT NULL,
  optimization_applied TEXT NOT NULL,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SPEED OPTIMIZATION INDICES (Eliminating bottlenecks on critical lookups)
CREATE INDEX IF NOT EXISTS idx_query_profiles_path ON query_performance_profiles(endpoint_path);