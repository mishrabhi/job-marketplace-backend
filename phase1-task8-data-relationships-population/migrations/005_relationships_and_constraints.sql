CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. JOBS TABLE (Belongs to Company)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT, -- Block company delete if active jobs exist
  title TEXT NOT NULL,
  min_gpa NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (min_gpa >= 0.00 AND min_gpa <= 10.00),
  salary_lpa NUMERIC(5,2) NOT NULL CHECK (salary_lpa > 0),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  gpa NUMERIC(3,2) NOT NULL CHECK (gpa >= 0.00 AND gpa <= 10.00),
  grad_year INTEGER NOT NULL CHECK (grad_year BETWEEN 2020 AND 2035),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. APPLICATIONS TABLE (Many-to-Many Join with Composite Key & Cascade)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,       -- If job deleted, cascade delete applications
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE, -- If student deleted, cascade delete applications
  status TEXT NOT NULL DEFAULT 'APPLIED' CHECK (status IN ('APPLIED', 'SHORTLISTED', 'OFFERED', 'REJECTED')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_job UNIQUE (job_id, student_id)              -- Enforce integrity constraint against duplicates
);

-- Indexes to eliminate full-table scans on relationship lookups
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);