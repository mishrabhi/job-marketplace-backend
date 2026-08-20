-- Migration 006: Targeted Indexes for Hot Query Optimization

-- 1. Composite Index for Filtered Student Search with Projections
CREATE INDEX IF NOT EXISTS idx_students_grad_gpa_status 
ON students (grad_year, gpa DESC) 
INCLUDE (id, full_name, email); -- Covering Index to eliminate table lookup overhead

-- 2. Index for Rapid Status Lookups on Applications
CREATE INDEX IF NOT EXISTS idx_applications_status_applied 
ON applications (status, applied_at DESC);