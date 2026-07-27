-- 1. REAL-TIME CANDIDATE FEATURE STORE
-- Stores feature vectors used for online recommendation inference and offline training
CREATE TABLE IF NOT EXISTS candidate_feature_store (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL UNIQUE,
  tenant_id           UUID NOT NULL,                       -- Strict multi-tenant isolation checking
  feature_version     TEXT NOT NULL DEFAULT 'v1.0',       -- Guarantees train/serve feature parity
  skills_vector       JSONB NOT NULL DEFAULT '[]',
  applications_count  INTEGER NOT NULL DEFAULT 0,
  avg_match_score     NUMERIC(5, 4) NOT NULL DEFAULT 0.0,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FEATURE CACHE INVALIDATION & FRESHNESS AUDIT LOG
-- Tracks cache invalidation events to prevent stale feature serving
CREATE TABLE IF NOT EXISTS feature_cache_invalidations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL,
  tenant_id           UUID NOT NULL,                       -- Multi-tenant boundary check
  invalidation_reason TEXT NOT NULL,
  invalidated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_store_student ON candidate_feature_store(student_id, tenant_id);