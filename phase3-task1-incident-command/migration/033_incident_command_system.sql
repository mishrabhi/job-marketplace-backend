-- 1. INCIDENT LIFECYCLE MANAGEMENT TABLE
CREATE TABLE IF NOT EXISTS platform_incidents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  severity            TEXT NOT NULL CHECK (severity IN ('SEV_1_CRITICAL', 'SEV_2_MAJOR', 'SEV_3_MINOR')),
  on_call_responder   UUID NOT NULL,
  status              TEXT NOT NULL DEFAULT 'triggered' CHECK (status IN ('triggered', 'acknowledged', 'mitigated', 'resolved')),
  comms_updates       JSONB NOT NULL DEFAULT '[]', -- Chronological internal/external updates
  postmortem_payload  JSONB DEFAULT NULL,          -- Houses the final blameless postmortem
  idempotency_key     TEXT UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DYNAMIC RANKED DEFECT INGESTION QUEUE
CREATE TABLE IF NOT EXISTS platform_defects_triage (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_signature     TEXT UNIQUE NOT NULL,       -- Hash of error type + trace location
  error_message       TEXT NOT NULL,
  stack_trace         TEXT NOT NULL,
  impacted_tenant_id  UUID,                       -- Explicit college/company tenant boundary mapping
  occurrence_count    INTEGER NOT NULL DEFAULT 1,
  priority_score      INTEGER NOT NULL DEFAULT 1, -- Automatically calculated by frequency * severity
  status              TEXT NOT NULL DEFAULT 'untriaged' CHECK (status IN ('untriaged', 'backlogged', 'resolved')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PHASE 3 SYSTEM BACKLOG LEDGER
CREATE TABLE IF NOT EXISTS phase3_backend_backlog (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  defect_ref_id       UUID REFERENCES platform_defects_triage(id) ON DELETE SET NULL,
  task_title          TEXT NOT NULL,
  engineering_owner   TEXT NOT NULL,              -- Named engineer owner
  bar_target_metrics  TEXT NOT NULL,              -- Explicit numerical metric target criteria
  idempotency_key     TEXT UNIQUE NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON platform_incidents(status);
CREATE INDEX IF NOT EXISTS idx_defects_priority ON platform_defects_triage(priority_score DESC);