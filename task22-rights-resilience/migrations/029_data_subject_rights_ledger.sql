-- Tracks data-subject formal right executions under DPDP compliance mandates 
CREATE TABLE IF NOT EXISTS data_subject_requests_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL,
  request_type        TEXT NOT NULL CHECK (request_type IN ('ACCESS_EXPORT', 'ERASURE_PURGE')),
  execution_status    TEXT NOT NULL DEFAULT 'completed' CHECK (execution_status IN ('pending', 'completed', 'failed')),
  metadata_summary    JSONB NOT NULL DEFAULT '{}', -- Tracks row counts exported or cascaded entity deletions
  idempotency_key     TEXT UNIQUE NOT NULL,
  executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ds_requests_user ON data_subject_requests_log(user_id);