-- 1. UNIFIED APPLICATION TRACKING TABLE UPDATE
-- Centralizes the end-to-end operational states of application lifecycles
CREATE TABLE IF NOT EXISTS application_status_history (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id      UUID NOT NULL,
  previous_status     TEXT,
  new_status          TEXT NOT NULL,
  changed_by          UUID NOT NULL, -- Account identity context triggering modification
  reason_note         TEXT,
  changed_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_hist_app ON application_status_history(application_id);