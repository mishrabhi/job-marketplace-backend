-- Track comprehensive cross-portal end-to-end integration metrics 
CREATE TABLE IF NOT EXISTS portal_dry_run_audits (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_session_token  TEXT NOT NULL,
  portal_domain       TEXT NOT NULL CHECK (portal_domain IN ('college_portal', 'admin_console', 'student_view')),
  checkpoint_step     TEXT NOT NULL,
  state_payload       JSONB NOT NULL DEFAULT '{}',
  is_verified         BOOLEAN NOT NULL DEFAULT true,
  executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_audits_session ON portal_dry_run_audits(test_session_token);