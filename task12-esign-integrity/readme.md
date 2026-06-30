# e-Sign Integration & Cryptographic Tamper-Evidence Core 

This module implements secure digital signature workflows and a cryptographic tamper-evidence engine for the PlaceMux backend. Every digitally signed offer is protected using a **SHA-256 checksum**, allowing independent verification of document authenticity and ensuring that any unauthorized modification is immediately detectable.


# Folder Structure

```text id="m7kz31"
task12-esign-tamper/
├── migrations/
│   └── 019_esign_tables.sql             # e-Sign & audit verification schema
├── src/
│   ├── config/
│   │   ├── db.js                        # Database connection
│   │   ├── env.js                       # Environment configuration
│   │   └── logger.js                    # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js              # Global error handler
│   ├── validators/
│   │   └── esign.validator.js           # Request validation schemas
│   ├── controllers/
│   │   └── esign.controller.js          # e-Sign & verification endpoints
│   ├── services/
│   │   └── esign.service.js             # Signature generation & audit verification
│   └── routes/
│       ├── esign.routes.js              # /api/v1/esign endpoints
│       └── index.js                     # Route registry
├── app.js                               # Express application
├── server.js                            # Server bootstrap
├── package.json                         # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Secure Digital Signature Workflow

The signing endpoint securely records a candidate's acceptance of an offer by capturing:

* Offer ID
* Student ID
* Candidate IP Address
* Timestamp
* Cryptographic checksum

The resulting checksum acts as a unique fingerprint for the signed document.


## 2. SHA-256 Integrity Verification

Every signed offer generates a **SHA-256 verification checksum** using immutable offer attributes.

Typical inputs include:

* Offer ID
* Student ID
* Company Name
* Role
* Compensation
* Signature Timestamp
* Candidate IP Address

The generated checksum guarantees:

* Document authenticity
* Data integrity
* Tamper detection
* Independent verification

If any protected field changes, the checksum changes immediately.


## 3. Tamper-Evident Audit Verification

The audit verification endpoint recalculates the checksum from the current database state.

Workflow:

```text id="k18hfr"
Stored Offer
      │
      ▼
Recalculate SHA-256 Checksum
      │
      ▼
Compare With Provided Checksum
      │
      ├────────────► Match
      │                 │
      │                 ▼
      │        VERIFIED_AUTHENTIC
      │
      ▼
Mismatch
      │
      ▼
TAMPER_DETECTED
```

This allows any stakeholder to independently verify whether an offer has remained unchanged since it was digitally signed.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash id="x1fjol"
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/019_esign_tables.sql
```


## 2. Install Dependencies

```bash id="awj1mn"
npm install
```


## 3. Start Development Server

```bash id="0ww02t"
npm run dev
```


# Evaluation Execution Guide

Configure the environment variables.

```bash id="t3vwkk"
export BASE=http://localhost:3009/api/v1
export OFFER_UUID="<insert-target-offer-id-uuid>"
```


## Step 1 — Execute Digital Signature Placement

```bash id="4aol1u"
curl -X POST "$BASE/esign/sign" \
  -H "Content-Type: application/json" \
  -d "{
    \"offer_id\": \"$OFFER_UUID\",
    \"candidate_ip\": \"192.168.1.45\",
    \"signed_by_student_id\": \"4b111d42-ab12-4211-8224-2da21e48bc02\"
  }"
```

### Expected Result

Returns **HTTP 200 OK** with a response similar to:

```json id="v2vgf9"
{
  "success": true,
  "verifiable_fingerprint": "<SHA-256 checksum>"
}
```

The generated checksum uniquely represents the signed document and can later be used for independent verification.


## Step 2 — Verify Document Authenticity

```bash id="vruyzj"
curl -X GET "$BASE/esign/verify-audit?offer_id=$OFFER_UUID&provided_checksum=<PASTE_THE_CHECKSUM_GENERATED_ABOVE>"
```

### Expected Result

```json id="jk9gdn"
{
  "authentic": true,
  "audit_verdict": "VERIFIED_AUTHENTIC"
}
```

The recalculated checksum matches the original checksum, confirming that the document has not been modified.


## Step 3 — Demonstrate Tamper Detection

Suppose an administrator directly modifies a protected field (for example, `ctc_paise`) in the `hr_offers` table using a database console.

Re-run the verification request:

```bash id="3zj8ji"
curl -X GET "$BASE/esign/verify-audit?offer_id=$OFFER_UUID&provided_checksum=<OLD_CHECKSUM>"
```

### Expected Result

```json id="ghjlwm"
{
  "authentic": false,
  "audit_verdict": "TAMPER_DETECTED"
}
```

Because the underlying offer data has changed, the recalculated SHA-256 checksum no longer matches the original fingerprint, immediately exposing the unauthorized modification.


# Security Features

* SHA-256 document fingerprinting
* Cryptographic integrity verification
* Tamper-evident document protection
* Secure digital signature workflow
* Independent audit verification
* Immutable checksum generation
* Candidate signature tracking
* Structured audit logging


# e-Sign Verification Lifecycle

```text id="kff8mq"
Offer Generated
        │
        ▼
Student Signs Offer
        │
        ▼
Generate SHA-256 Fingerprint
        │
        ▼
Store Signature Metadata
        │
        ▼
Audit Verification Request
        │
        ▼
Recalculate SHA-256 Checksum
        │
        ▼
Compare Checksums
        │
        ├──────────────► Match
        │                  │
        │                  ▼
        │        VERIFIED_AUTHENTIC
        │
        ▼
Mismatch
        │
        ▼
TAMPER_DETECTED
```

