-- 1. ASSESSMENT ITEM BANK TABLE
-- Stores test questions managed exclusively by system administrators 
CREATE TABLE IF NOT EXISTS assessment_item_bank (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic               TEXT NOT NULL,
  difficulty_level    TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  question_payload    JSONB NOT NULL, -- Contains question string, code snippets, choices
  correct_meta        JSONB NOT NULL, -- Contains correct answer verification keys
  created_by          UUID NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROCTORING REVIEW QUEUE TABLE
-- Tracks flagged candidate exams awaiting human administrative investigation 
CREATE TABLE IF NOT EXISTS proctoring_review_queue (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_session_id     UUID NOT NULL,
  student_id          UUID NOT NULL,
  flagged_reason      TEXT NOT NULL, -- e.g., 'MULTIPLE_FACES_DETECTED', 'TAB_SWITCH_EXCEEDED'
  ai_confidence_score NUMERIC(5,2) NOT NULL, -- Threshold parameters from ML upstream 
  review_status       TEXT NOT NULL DEFAULT 'pending_review'
                      CHECK (review_status IN ('pending_review', 'cleared', 'disqualified')),
  resolved_by         UUID,
  resolution_notes    TEXT,
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_item_bank_topic ON assessment_item_bank(topic);
CREATE INDEX IF NOT EXISTS idx_proctor_queue_status ON proctoring_review_queue(review_status);