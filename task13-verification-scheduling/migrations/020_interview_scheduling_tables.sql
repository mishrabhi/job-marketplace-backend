-- Tracks schedule bookings for candidates
CREATE TABLE IF NOT EXISTS interview_slots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL,
  interviewer_id  UUID NOT NULL,
  student_id      UUID NOT NULL,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end   TIMESTAMPTZ NOT NULL,
  meeting_link    TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  idempotency_key TEXT UNIQUE NOT NULL, -- Safeguards booking retries [cite: 391, 435]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_slots_app ON interview_slots(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_slots_time ON interview_slots(scheduled_start);