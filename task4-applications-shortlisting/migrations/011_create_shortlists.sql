CREATE TABLE IF NOT EXISTS shortlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'shortlisted',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_shortlists_application_id ON shortlists(application_id);
CREATE INDEX idx_shortlists_company_id ON shortlists(company_id);
CREATE INDEX idx_shortlists_status ON shortlists(status);
