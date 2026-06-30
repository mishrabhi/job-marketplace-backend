-- Track and lock down cryptographic digital signature receipts
CREATE TABLE IF NOT EXISTS hr_offer_signatures (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id              UUID NOT NULL UNIQUE REFERENCES hr_offers(id),
  candidate_ip          TEXT NOT NULL,
  signed_by_student_id  UUID NOT NULL,
  document_payload_hash TEXT NOT NULL, -- Cryptographic baseline verification hash [cite: 245]
  tamper_checksum       TEXT NOT NULL, -- Combined tamper-evident digital seal 
  signed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_sigs_checksum ON hr_offer_signatures(tamper_checksum);