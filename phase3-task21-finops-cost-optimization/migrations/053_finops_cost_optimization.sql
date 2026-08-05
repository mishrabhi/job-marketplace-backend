-- 1. BACKEND WORKLOAD COST ATTRIBUTION LEDGER
-- Records granular transaction costs (DB compute, network egress, storage tier) per tenant[cite: 17]
CREATE TABLE IF NOT EXISTS finops_workload_costs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,                       -- Strict multi-tenant isolation boundary[cite: 17]
  operation_type      TEXT NOT NULL,                       -- e.g., 'CANDIDATE_APPLICATION', 'SHORTLIST_RANKING'[cite: 17]
  payload_bytes       INTEGER NOT NULL DEFAULT 0,
  db_query_time_ms    INTEGER NOT NULL DEFAULT 0,
  estimated_cost_inr  NUMERIC(10, 6) NOT NULL DEFAULT 0.0,
  is_optimized        BOOLEAN NOT NULL DEFAULT false,
  idempotency_key     TEXT UNIQUE NOT NULL,                -- Concurrency and retry safety[cite: 17]
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. UNIT ECONOMICS BEFORE/AFTER AUDIT METRICS
-- Tracks unit economics performance per 1,000 transactions before and after optimization[cite: 17]
CREATE TABLE IF NOT EXISTS finops_unit_economics (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,                       -- Tenant context check[cite: 17]
  batch_identifier    TEXT NOT NULL,                       -- e.g., 'baseline_v1_run', 'optimized_v2_run'
  transaction_count   INTEGER NOT NULL DEFAULT 1000,
  total_cost_inr      NUMERIC(10, 2) NOT NULL,
  cost_per_1k_inr     NUMERIC(10, 2) NOT NULL,
  avg_latency_ms      NUMERIC(8, 2) NOT NULL,
  calculated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finops_tenant ON finops_workload_costs(tenant_id, operation_type);
CREATE INDEX IF NOT EXISTS idx_finops_unit_tenant ON finops_unit_economics(tenant_id);