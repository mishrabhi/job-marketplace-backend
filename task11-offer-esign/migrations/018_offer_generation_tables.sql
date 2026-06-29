-- 1. OFFERS TABLE
-- Tracks individual document lifecycles linked to candidate profiles
CREATE TABLE IF NOT EXISTS hr_offers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id      UUID NOT NULL, -- Dependency: Application/shortlist mapping layer
  student_id          UUID NOT NULL,
  company_name        TEXT NOT NULL,
  ctc_paise           BIGINT NOT NULL,
  role_title          TEXT NOT NULL,
  valid_until         TIMESTAMPTZ NOT NULL,
  status              TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'generated', 'sent', 'signed', 'expired', 'declined')),
  idempotency_key     TEXT UNIQUE NOT NULL, -- Safeguards generation retries[cite: 2]
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ESIGN INTEGRATION LOGS
-- Captures the cryptographically secure configuration choices & audits[cite: 2]
CREATE TABLE IF NOT EXISTS esign_configurations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id            UUID NOT NULL REFERENCES hr_offers(id),
  provider_selected   TEXT NOT NULL CHECK (provider_selected IN ('aadhaar_digital_io', 'docusign', 'custom_crypto_keys')),
  security_hash       TEXT NOT NULL, -- Ensures signature is verifiable & tamper-evident[cite: 2]
  is_approved         BOOLEAN NOT NULL DEFAULT false,
  metadata_snapshots  JSONB DEFAULT '{}',
  configured_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hr_offers_app ON hr_offers(application_id);
CREATE INDEX IF NOT EXISTS idx_hr_offers_status ON hr_offers(status);