# DPDP Consent Management & Right to be Forgotten Erasure Engine

This module implements the **Digital Personal Data Protection (DPDP) Compliance Layer** for the PlaceMux backend. It provides granular consent management, immutable consent audit trails, and a **Right to be Forgotten** workflow that enables users to request deletion of their personal data in compliance with privacy regulations.

The module ensures that every consent action is traceable while providing secure mechanisms to erase user data upon valid requests.


# Folder Structure

```text id="s2am5x"
task21-dpdp-consent/
├── migrations/
│   └── 028_dpdp_consent_tables.sql        # Consent & data erasure schema
├── src/
│   ├── config/
│   │   ├── db.js                          # Database connection
│   │   ├── env.js                         # Environment configuration
│   │   └── logger.js                      # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                # Global error handler
│   ├── validators/
│   │   └── privacy.validator.js           # Consent & erasure validation schemas
│   ├── controllers/
│   │   └── privacy.controller.js          # Privacy compliance endpoints
│   ├── services/
│   │   └── privacy.service.js             # Consent management & data erasure engine
│   └── routes/
│       ├── privacy.routes.js              # /api/v1/privacy endpoints
│       └── index.js                       # Route registry
├── app.js                                 # Express application
├── server.js                              # Server bootstrap
├── package.json                           # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Granular Consent Management

The consent engine records individual consent preferences for every user.

Each consent record includes:

* User ID
* Consent Type
* Consent Status
* IP Address
* User Agent
* Timestamp

This creates a permanent audit trail of user consent decisions.


## 2. Idempotent Consent Registration

Every consent request includes a unique:

```text id="ygyzfr"
idempotency_key
```

The engine guarantees:

* Duplicate submissions do not create duplicate consent records.
* Previously processed requests are safely returned.
* Network retries cannot accidentally duplicate consent events.


## 3. Right to be Forgotten

The privacy service supports secure user data deletion requests.

The erasure workflow:

1. Validates the target user.
2. Identifies personal records linked to the user.
3. Deletes or anonymizes eligible personal data.
4. Records the erasure request in the audit log.
5. Returns a confirmation response.

This enables compliance with DPDP data subject rights.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash id="u8aqgm"
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/028_dpdp_consent_tables.sql
```


## 2. Install Dependencies

```bash id="poh8mg"
npm install
```


## 3. Start Development Server

```bash id="v7thbk"
npm run dev
```

# Evaluator Validation Guide

Configure the required environment variables.

```bash id="8r6mng"
export BASE=http://localhost:3009/api/v1
export USER_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
```

## Step 1 — Register User Consent

```bash id="gbqzwd"
curl -X POST "$BASE/privacy/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_UUID\",
    \"consent_type\": \"profile_sharing\",
    \"is_granted\": true,
    \"ip_address\": \"103.45.201.22\",
    \"user_agent\": \"Mozilla/5.0 Chrome/121.0.0\",
    \"idempotency_key\": \"unique-consent-affirmation-token-x001\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json id="9n2vpk"
{
  "success": true,
  "consent_registered": true
}
```

Verify that the consent record has been persisted to the consent tracking table.

If the same request is submitted again using the identical `idempotency_key`, the previously recorded result is returned instead of creating a duplicate consent entry.


## Step 2 — Execute Right to be Forgotten

```bash id="70s0mk"
curl -X POST "$BASE/privacy/purge-data" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_UUID\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json id="jhsgrb"
{
  "success": true,
  "data_erased": true
}
```

The service deletes or anonymizes the user's eligible personal data and records the erasure request for compliance auditing.


# Privacy & Security Features

* Granular consent management
* Immutable consent audit trail
* Idempotent consent registration
* Right to be Forgotten workflow
* User data anonymization/erasure
* Structured compliance logging
* Persistent audit records
* Production-ready privacy architecture


# Consent Registration Workflow

```text id="ghqzlf"
Consent Request
        │
        ▼
Validate Payload
        │
        ▼
Check Idempotency Key
        │
        ├──────────────► Existing Record
        │                  │
        │                  ▼
        │          Return Previous Result
        │
        ▼
Persist Consent
        │
        ▼
Record Audit Entry
        │
        ▼
Return Confirmation
```


# Data Erasure Workflow

```text id="brt0qa"
Erasure Request
        │
        ▼
Validate User
        │
        ▼
Locate Personal Records
        │
        ▼
Delete / Anonymize Data
        │
        ▼
Record Erasure Audit
        │
        ▼
Return Confirmation
```
