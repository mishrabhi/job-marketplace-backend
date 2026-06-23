-- Optional: Create search log table for analytics
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID,
  query TEXT,
  results_count INT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_logs_student_id ON search_logs(student_id);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at);
