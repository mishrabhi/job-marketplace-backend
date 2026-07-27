-- 1. SEARCHABLE CANDIDATE EMBEDDINGS INDEX
-- Stores dense vector embeddings alongside full-text search tsvector columns[cite: 19]
CREATE TABLE IF NOT EXISTS candidate_search_index (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id          UUID NOT NULL UNIQUE,
  tenant_id           UUID NOT NULL,                       -- Strict multi-tenant isolation checking[cite: 19]
  full_name           TEXT NOT NULL,
  headline            TEXT NOT NULL,
  skills_keywords     TEXT NOT NULL,
  search_vector       tsvector GENERATED ALWAYS AS (
                        to_tsvector('english', coalesce(full_name, '') || ' ' || coalesce(headline, '') || ' ' || coalesce(skills_keywords, ''))
                      ) STORED,                            -- Lexical full-text search index[cite: 19]
  dense_embedding     JSONB NOT NULL DEFAULT '[]',         -- Simulated vector embedding array[cite: 19]
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SEARCH PERFORMANCE TELEMETRY AUDIT LEDGER
CREATE TABLE IF NOT EXISTS search_execution_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id           UUID NOT NULL,
  query_string        TEXT NOT NULL,
  total_hits          INTEGER NOT NULL,
  latency_ms          INTEGER NOT NULL,
  page_number         INTEGER NOT NULL,
  executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_fulltext ON candidate_search_index USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_search_tenant ON candidate_search_index(tenant_id, is_active);