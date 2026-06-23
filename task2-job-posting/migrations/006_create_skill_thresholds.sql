CREATE TABLE IF NOT EXISTS skill_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL,
  min_level INT NOT NULL CHECK (min_level >= 1 AND min_level <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_skill_thresholds_job_id ON skill_thresholds(job_id);
