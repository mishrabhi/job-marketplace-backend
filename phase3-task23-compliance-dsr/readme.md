# Compliance Audit: DPDP, GDPR & SOC 2 Readiness Engine

This module implements the **Compliance Audit & Data Subject Rights Engine** for the PlaceMux backend. It provides DPDP/GDPR-aligned Data Subject Rights (DSR) workflows, including access, export, correction, and the **Right to Be Forgotten**.

The engine supports automated cascading data deletion across multiple storage layers while generating cryptographic evidence artifacts that provide verifiable proof of deletion.


# Folder Structure

```text
phase3-task23-compliance/
├── migrations/
│   └── 055_compliance_audit_tables.sql       # DSR & compliance evidence schema
├── src/
│   ├── config/
│   │   ├── db.js                             # Database connection
│   │   ├── env.js                            # Environment configuration
│   │   └── logger.js                         # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                   # Global error handler
│   ├── validators/
│   │   └── compliance.validator.js            # DSR request validation
│   ├── controllers/
│   │   └── compliance.controller.js           # Compliance endpoints
│   ├── services/
│   │   └── compliance.service.js              # DSR & compliance engine
│   └── routes/
│       ├── compliance.routes.js               # /api/v1/compliance endpoints
│       └── index.js                           # Route registry
├── app.js                                     # Express application
├── server.js                                  # Server bootstrap
├── package.json                               # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Data Subject Rights (DSR)

The compliance engine supports structured data-subject requests for:

- Access
- Data Export
- Data Correction
- Right to Be Forgotten

Every request is associated with a tenant and candidate identity and receives a persistent DSR request record.


## 2. Right to Be Forgotten

The deletion workflow supports cascading removal of candidate data across multiple storage layers.

The purge process covers:

- Primary Database Tables
- Search Index
- Feature Store
- Other registered data stores

The deletion process generates cryptographic evidence after completion.


## 3. Cryptographic Deletion Evidence

After a successful purge, the system generates a verification hash and stores the evidence in:

```text
compliance_deletion_evidence_logs
```

This provides an auditable record that can be used to verify the deletion operation.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/054_compliance_audit_tables.sql
```


## 2. Install Dependencies

```bash
npm install
```


## 3. Start Development Server

```bash
npm run dev
```

# Evaluator Validation Guide

Configure the required environment variables.

```bash
export BASE=http://localhost:3009/api/v1/compliance

export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"

export CANDIDATE_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"

export ADMIN_UUID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```

## Step 1 — Submit a Right to Be Forgotten DSR Request

```bash
curl -X POST "$BASE/dsr/submit" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"candidate_id\": \"$CANDIDATE_UUID\",
    \"request_type\": \"RIGHT_TO_BE_FORGOTTEN\",
    \"requested_by_email\": \"candidate.forget@university.edu\",
    \"idempotency_key\": \"dsr-forget-token-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "dsr_request": {
    "status": "pending"
  }
}
```

The DSR request is registered and placed into the `pending` state awaiting execution.


## Step 2 — Execute Cascading Data Purge

Use the DSR request UUID returned from Step 1.

```bash
curl -X POST "$BASE/dsr/execute-purge" \
  -H "Content-Type: application/json" \
  -d "{
    \"dsr_request_id\": \"<INSERT_DSR_REQUEST_UUID_FROM_STEP_1>\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"actor_id\": \"$ADMIN_UUID\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "purge_completed": true,
  "deletion_verification_hash": "a8c91f2d..."
}
```

The candidate's data is removed from the supported storage layers, including:

```text
Primary Database
      │
      ├──► Search Index
      │
      ├──► Feature Store
      │
      └──► Other Registered Stores
                │
                ▼
      Cryptographic Evidence
```

A deletion verification hash is generated and persisted inside:

```text
compliance_deletion_evidence_logs
```


## Step 3 — Compile Data Subject Access / Export Request

Use the DSR request UUID from Step 1.

```bash
curl -X GET \
  "$BASE/dsr/export?dsr_request_id=<INSERT_DSR_REQUEST_UUID_FROM_STEP_1>&tenant_id=$TENANT_UUID"
```

### Expected Result

Returns **HTTP 200 OK**.

The response contains a comprehensive candidate data export bundle representing the data available for the requested data subject.


# Compliance Features

- DPDP Data Subject Rights Support
- GDPR Data Subject Rights Support
- Data Access & Export
- Data Correction Workflow
- Right to Be Forgotten
- Cascading Multi-Store Data Purging
- Search Index Data Removal
- Feature Store Data Removal
- Cryptographic Deletion Verification
- Compliance Evidence Logging
- Tenant-Scoped Compliance Operations


# DSR Request Workflow

```text
Data Subject Request
        │
        ▼
Create DSR Record
        │
        ▼
Validate Tenant & Candidate
        │
        ▼
Process Requested Right
        │
        ├────────────► Access / Export
        │
        ├────────────► Correction
        │
        └────────────► Right to Be Forgotten
```


# Right to Be Forgotten Workflow

```text
DSR Request
     │
     ▼
Pending
     │
     ▼
Execute Purge
     │
     ├──────────────► Primary Database
     │
     ├──────────────► Search Index
     │
     ├──────────────► Feature Store
     │
     └──────────────► Registered Data Stores
                       │
                       ▼
              Generate Verification Hash
                       │
                       ▼
             Store Compliance Evidence
```


# Compliance Evidence Workflow

```text
Deletion Operation
        │
        ▼
Verify Storage Purges
        │
        ▼
Generate Cryptographic Hash
        │
        ▼
Persist Evidence Record
        │
        ▼
Auditable Deletion Proof
```
