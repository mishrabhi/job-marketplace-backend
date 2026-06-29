# PlaceMux Backend — Offer Generation & Cryptographic e-Sign Mapping Matrix (Task 11)

This module implements the **Offer Generation & Cryptographic e-Sign Mapping Matrix** for the PlaceMux backend. It provides secure, idempotent offer generation, cryptographic integrity verification, and legal e-Sign provider mapping to ensure hiring offers remain tamper-evident and legally verifiable throughout their lifecycle.


# Folder Structure

```text
task11-offer-esign/
├── migrations/
│   └── 018_offer_generation_tables.sql   # Offer generation & e-Sign schema
├── src/
│   ├── config/
│   │   ├── db.js                         # Database connection
│   │   ├── env.js                        # Environment validation
│   │   └── logger.js                     # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js               # Global error handler
│   ├── validators/
│   │   └── offer.validator.js            # Zod request validation
│   ├── controllers/
│   │   └── offer.controller.js           # Offer generation & e-Sign endpoints
│   ├── services/
│   │   └── offer.service.js              # Business logic for offers & integrity checks
│   └── routes/
│       ├── offer.routes.js               # /api/v1/offers endpoints
│       └── index.js                      # Route registry
├── app.js                                # Express application
├── server.js                             # Server bootstrap
├── package.json                          # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Atomic Offer Generation

Offer generation is implemented as an **idempotent operation**.

Every request includes a unique:

```text
idempotency_key
```

The backend checks whether this key has already been processed.

* If the key is new:

  * A new offer is generated.
  * A unique offer identifier is created.
  * Metadata is securely stored.

* If the same key is received again:

  * No duplicate offer is created.
  * The previously generated offer is returned immediately.

This guarantees that repeated client requests caused by retries or network failures never create duplicate hiring offers.


## 2. Cryptographic Integrity Verification

Each generated offer is assigned a unique **security hash** derived from immutable offer attributes.

Typical inputs include:

* Offer ID
* Student ID
* Company Name
* Role
* Compensation
* Expiry Date
* Selected e-Sign Provider

The resulting cryptographic hash ensures:

* Document authenticity
* Tamper detection
* Integrity verification
* Secure auditability

If any protected field changes, the computed hash changes immediately, making document tampering detectable.


## 3. e-Sign Provider Mapping

Once an offer is generated, an e-Sign provider can be securely attached.

Supported workflow:

```text
Generate Offer
        │
        ▼
Choose e-Sign Provider
        │
        ▼
Compute Security Hash
        │
        ▼
Persist Provider Mapping
        │
        ▼
Offer Ready for Digital Signature
```

This architecture allows future integration with multiple digital signature providers without modifying offer generation logic.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration inside your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/018_offer_generation_tables.sql
```


## 2. Install Dependencies

```bash
npm install
```


## 3. Start Development Server

```bash
npm run dev
```


# Verification Demo Guide

Configure the API base URL.

```bash
export BASE=http://localhost:3009/api/v1
```


## Phase A — Generate an Offer

```bash
curl -X POST "$BASE/offers/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "8a329d41-cc21-4112-9114-1da21e48bc01",
    "student_id": "4b111d42-ab12-4211-8224-2da21e48bc02",
    "company_name": "Altrodav Technologies Pvt. Ltd.",
    "ctc_paise": 120000000,
    "role_title": "Associate Systems Architect",
    "valid_until": "2026-07-15T23:59:59Z",
    "idempotency_key": "unique-generation-intent-string-token-001"
  }'
```

### Expected Result

* Returns **HTTP 201 Created**
* Generates a new offer record
* Stores offer metadata securely
* Computes integrity metadata
* Repeating the request with the same `idempotency_key` returns the existing offer instead of creating a duplicate


## Phase B — Choose an e-Sign Provider

```bash
curl -X POST "$BASE/offers/choose-esign" \
  -H "Content-Type: application/json" \
  -d '{
    "offer_id": "<GENERATED_OFFER_UUID>",
    "provider_selected": "aadhaar_digital_io"
  }'
```

### Expected Result

The backend:

* Associates the selected e-Sign provider
* Computes a cryptographic `security_hash`
* Stores the mapping securely
* Returns the updated offer metadata

Any subsequent modification of protected offer fields invalidates the hash, making the document tamper-evident.


# Security Features

* Idempotent offer generation
* Duplicate request prevention
* Cryptographic integrity verification
* Tamper-evident document hashes
* Immutable offer metadata
* Secure e-Sign provider mapping
* Structured audit logging
* Production-ready architecture


# 📋 Offer Generation Lifecycle

```text
Student Application
        │
        ▼
Generate Offer Request
        │
        ▼
Validate Payload
        │
        ▼
Check Idempotency Key
        │
        ├───────────────► Existing Offer → Return Response
        │
        ▼
Create New Offer
        │
        ▼
Generate Security Hash
        │
        ▼
Persist Offer
        │
        ▼
Select e-Sign Provider
        │
        ▼
Store Provider Mapping
        │
        ▼
Offer Ready for Digital Signature
```


# Key Features

* Secure Offer Generation
* Idempotent API Design
* Cryptographic Security Hashing
* Tamper-Evident Offer Integrity
* e-Sign Provider Mapping
* Immutable Offer Metadata
* Structured Validation
* Audit Logging
* Production-ready Architecture
