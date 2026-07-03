-- 1. COLLEGES TENANT INDEX
CREATE TABLE IF NOT EXISTS platform_colleges (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  state_region        TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. COLLEGE ADMIN PROFILE ROLES
-- Explicitly tracks permissions to ensure colleges cannot view cross-tenant rows 
CREATE TABLE IF NOT EXISTS college_admins (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id          UUID NOT NULL REFERENCES platform_colleges(id) ON DELETE CASCADE,
  user_identity_id    UUID NOT NULL, -- Ties to primary platform identity profile account
  role_title          TEXT NOT NULL DEFAULT 'placement_officer' 
                      CHECK (role_title IN ('placement_officer', 'college_director')),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ENHANCE STUDENTS RELATION WITH TENANT MAPPING
ALTER TABLE IF EXISTS students 
  ADD COLUMN IF NOT EXISTS college_id UUID REFERENCES platform_colleges(id);

CREATE INDEX IF NOT EXISTS idx_college_admins_tenant ON college_admins(college_id, user_identity_id);