-- Migration 002: Performance Indexes & Secondary Constraints[cite: 9]

-- Composite Index for listing students by college, graduation year, and GPA[cite: 9]
CREATE INDEX IF NOT EXISTS idx_students_college_grad_gpa ON students (college_id, grad_year, gpa DESC);

-- Composite Index for job application queries by job and candidate status[cite: 9]
CREATE INDEX IF NOT EXISTS idx_applications_job_status ON applications (job_id, status);

-- Index for searching candidate submission history[cite: 9]
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications (student_id);

-- Index for filtering open jobs by minimum GPA requirements[cite: 9]
CREATE INDEX IF NOT EXISTS idx_jobs_status_gpa ON jobs (status, min_gpa);