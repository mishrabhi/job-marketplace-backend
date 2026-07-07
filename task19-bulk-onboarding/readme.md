# Bulk Student Cohort Onboarding Processing API Framework 

This module implements the **Bulk Student Cohort Onboarding Framework** for the PlaceMux backend. It enables colleges to securely import large student rosters while ensuring transactional consistency, idempotent processing, audit logging, and strict multi-tenant access control.

The onboarding engine is designed to efficiently process batch registrations without creating duplicate records or allowing unauthorized institutions to import student data.


# Folder Structure

```text
task19-bulk-onboarding/
├── migrations/
│   └── 026_bulk_onboarding_tables.sql      # Student onboarding & batch tracking schema
├── src/
│   ├── config/
│   │   ├── db.js                           # Database connection
│   │   ├── env.js                          # Environment configuration
│   │   └── logger.js                       # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                 # Global error handler
│   ├── validators/
│   │   └── onboarding.validator.js         # Request validation schemas
│   ├── controllers/
│   │   └── onboarding.controller.js        # Bulk onboarding endpoints
│   ├── services/
│   │   └── onboarding.service.js           # Batch import & authorization engine
│   └── routes/
│       ├── onboarding.routes.js            # /api/v1/onboard endpoints
│       └── index.js                        # Route registry
├── app.js                                  # Express application
├── server.js                               # Server bootstrap
├── package.json                            # Project manifest
└── README.md
```


#  Core Architecture & Workflow

## 1. Bulk Student Onboarding

The onboarding service processes multiple student records in a single transactional request.

Each student record may include:

* Full Name
* Email Address
* Graduation Year
* Academic Department

The batch is validated before processing to ensure data integrity.


## 2. Idempotent Batch Processing

Every upload request requires a unique:

```text
idempotency_key
```

The system guarantees:

* Duplicate upload requests do not create duplicate students.
* Previously processed batches are returned immediately.
* Safe retry behavior during network failures.

This ensures reliable bulk imports even when requests are accidentally repeated.


## 3. Multi-Tenant Authorization

Before processing a batch, the authorization layer verifies:

* College ID
* Operator User ID
* User-to-college association

Only authorized officers belonging to the specified institution may upload student rosters.

Any cross-tenant upload attempt is rejected before database operations begin.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/026_bulk_onboarding_tables.sql
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
export BASE=http://localhost:3009/api/v1

export VAL_COLLEGE_ID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
export AUTH_OFFICER_ID="2a226759-42b7-47b2-8490-67bc1e09bc33"
export STRANGER_USER_ID="7fffffff-ffff-ffff-ffff-ffffffffffff"
```


## Step 1 — Upload a Student Roster

```bash
curl -X POST "$BASE/onboard/roster-upload" \
  -H "Content-Type: application/json" \
  -d "{
    \"college_id\": \"$VAL_COLLEGE_ID\",
    \"operator_user_id\": \"$AUTH_OFFICER_ID\",
    \"idempotency_key\": \"unique-csv-batch-upload-token-001\",
    \"student_roster\": [
      {
        \"full_name\": \"Amit Sharma\",
        \"email\": \"amit.sharma2026@university.edu\",
        \"graduation_year\": 2026,
        \"academic_dept\": \"Computer Science Engineering\"
      },
      {
        \"full_name\": \"Priya Patel\",
        \"email\": \"priya.patel2026@university.edu\",
        \"graduation_year\": 2026,
        \"academic_dept\": \"Information Technology\"
      }
    ]
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "students_imported": 2,
  "batch_status": "completed"
}
```

The onboarding batch is successfully processed and all student records are permanently stored.

If the same request is repeated using the identical `idempotency_key`, the service returns the previously processed batch instead of creating duplicate records.


## Step 2 — Verify Multi-Tenant Security

Attempt to upload a roster using an unauthorized user.

```bash
curl -X POST "$BASE/onboard/roster-upload" \
  -H "Content-Type: application/json" \
  -d "{
    \"college_id\": \"$VAL_COLLEGE_ID\",
    \"operator_user_id\": \"$STRANGER_USER_ID\",
    \"idempotency_key\": \"unauthorized-malicious-upload-intent\",
    \"student_roster\": [
      {
        \"full_name\": \"Leak Tester\",
        \"email\": \"leak.test@unauthorized.com\",
        \"graduation_year\": 2026,
        \"academic_dept\": \"Criminal Justice\"
      }
    ]
  }"
```

### Expected Result

Returns **HTTP 403 Forbidden**.

Example response:

```json
{
  "success": false,
  "error": "UNAUTHORIZED_COLLEGE_ACCESS"
}
```

The request is rejected before any records are written to the database, ensuring complete tenant isolation.


# Security Features

* Transactional bulk student onboarding
* Idempotent batch processing
* Duplicate upload prevention
* Multi-tenant authorization
* College-level data isolation
* Batch audit logging
* Structured validation
* Persistent database storage
* Production-ready onboarding architecture


# Bulk Onboarding Workflow

```text
Roster Upload Request
        │
        ▼
Validate Payload
        │
        ▼
Verify College Authorization
        │
        ▼
Check Idempotency Key
        │
        ├──────────────► Existing Batch
        │                  │
        │                  ▼
        │          Return Previous Result
        │
        ▼
Validate Student Records
        │
        ▼
Persist Student Data
        │
        ▼
Record Batch History
        │
        ▼
Return Success Response
```


# Authorization Workflow

```text
Incoming Upload
        │
        ▼
Read College ID
        │
        ▼
Read Operator User ID
        │
        ▼
Verify College Membership
        │
        ├──────────────► Authorized
        │                  │
        │                  ▼
        │          Process Upload
        │
        ▼
Unauthorized
        │
        ▼
Return 403 Forbidden
```