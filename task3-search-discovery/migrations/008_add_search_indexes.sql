-- Add tsvector column to jobs for full-text search
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate search_vector with title and description
UPDATE jobs SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- Create GIN index on search_vector for fast full-text search
CREATE INDEX IF NOT EXISTS idx_jobs_search_vector ON jobs USING gin(search_vector);

-- Create trigger to automatically update search_vector on job updates
CREATE OR REPLACE FUNCTION jobs_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_search_vector_update ON jobs;
CREATE TRIGGER jobs_search_vector_update BEFORE INSERT OR UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION jobs_search_vector_trigger();
