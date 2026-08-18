CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PLACEMENT DRIVES TABLE
CREATE TABLE IF NOT EXISTS placement_drives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  drive_title TEXT NOT NULL,
  min_gpa NUMERIC(3, 2) NOT NULL CHECK (min_gpa >= 0.00 AND min_gpa <= 10.00),
  drive_status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (drive_status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DRIVE JOB ROLES (Multi-step child entity)
CREATE TABLE IF NOT EXISTS drive_job_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id UUID NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
  role_title TEXT NOT NULL,
  openings_count INTEGER NOT NULL CHECK (openings_count > 0),
  ctc_lpa NUMERIC(5, 2) NOT NULL CHECK (ctc_lpa > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. DRIVE AUDIT TRAIL (Created inside same transaction)
CREATE TABLE IF NOT EXISTS drive_audit_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  drive_id UUID NOT NULL REFERENCES placement_drives(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drive_job_roles_drive_id ON drive_job_roles(drive_id);
CREATE INDEX IF NOT EXISTS idx_drive_audit_drive_id ON drive_audit_trail(drive_id);