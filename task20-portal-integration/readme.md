# Portals Integration & Ecosystem Validation Engine

This module implements the **Portals Integration & Ecosystem Validation Engine** for the PlaceMux backend. It coordinates and validates end-to-end workflows across the **College Portal**, **Student Portal**, and **Central Administrative Console**, ensuring that all subsystems interact correctly while maintaining tenant isolation, idempotent execution, and comprehensive audit logging.

The integration engine provides a single dry-run endpoint to verify the complete ecosystem without affecting production workflows.


# Folder Structure

```text
task20-portals-integration/
├── migrations/
│   └── 027_portals_integration_tables.sql     # Integration & validation schema
├── src/
│   ├── config/
│   │   ├── db.js                              # Database connection
│   │   ├── env.js                             # Environment configuration
│   │   └── logger.js                          # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                    # Global error handler
│   ├── validators/
│   │   └── integration.validator.js          # Request validation schemas
│   ├── controllers/
│   │   └── integration.controller.js         # Cross-portal validation endpoints
│   ├── services/
│   │   └── integration.service.js            # Ecosystem orchestration engine
│   └── routes/
│       ├── integration.routes.js             # /api/v1/integration endpoints
│       └── index.js                          # Route registry
├── app.js                                     # Express application
├── server.js                                  # Server bootstrap
├── package.json                               # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Cross-Portal Integration Engine

The validation engine coordinates multiple PlaceMux subsystems in a single execution.

The integrated workflow includes:

* College Portal
* Student Portal
* Administrative Console
* Application Tracking
* Status Management
* Audit Logging

Each subsystem is executed in sequence to verify that the overall ecosystem behaves consistently.

## 2. End-to-End Dry Run Validation

The dry-run endpoint simulates a complete user journey across all portals without requiring manual interaction.

Each execution validates:

* User authorization
* Portal coordination
* Status synchronization
* Database persistence
* Audit logging
* Tenant isolation

Every simulation is uniquely identified using:

```text
test_session_token
```

and protected against duplicate execution through:

```text
idempotency_key
```


## 3. Multi-Tenant Security

Before executing the integration workflow, the authorization layer verifies:

* College ID
* College Officer
* Student Association
* Administrative Context

Only authorized users belonging to the requested institution can execute ecosystem validation.

Unauthorized requests are rejected before any processing begins.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/027_portals_integration_tables.sql
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
export VALID_OFFICER_ID="2a226759-42b7-47b2-8490-67bc1e09bc33"
export STRANGER_USER_ID="9fffffff-ffff-ffff-ffff-ffffffffffff"
```


## Step 1 — Execute Cross-Portal Dry Run

```bash
curl -X POST "$BASE/integration/validate-dry-run" \
  -H "Content-Type: application/json" \
  -d "{
    \"test_session_token\": \"integrated-portal-dryrun-cycle-2026-pass\",
    \"college_id\": \"$VAL_COLLEGE_ID\",
    \"college_officer_id\": \"$VALID_OFFICER_ID\",
    \"student_id\": \"4b111d42-ab12-4211-8224-2da21e48bc02\",
    \"application_id\": \"8a329d41-cc21-4112-9114-1da21e48bc01\",
    \"admin_user_id\": \"6a226759-42b7-47b2-8490-67bc1e09bc48\",
    \"idempotency_key\": \"task20-dryrun-token-perimeter-safeties-abc\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "validation_status": "ECOSYSTEM_VALIDATED",
  "test_session": "integrated-portal-dryrun-cycle-2026-pass"
}
```

The response confirms that all participating portal components executed successfully.

If the same request is submitted again using the same `idempotency_key`, the previously recorded validation result is returned instead of executing the workflow again.


## Step 2 — Verify Tenant Isolation

Attempt to execute the validation workflow using an unauthorized college officer.

```bash
curl -X POST "$BASE/integration/validate-dry-run" \
  -H "Content-Type: application/json" \
  -d "{
    \"test_session_token\": \"malicious-unauthorized-dryrun-interception\",
    \"college_id\": \"$VAL_COLLEGE_ID\",
    \"college_officer_id\": \"$STRANGER_USER_ID\",
    \"student_id\": \"4b111d42-ab12-4211-8224-2da21e48bc02\",
    \"application_id\": \"8a329d41-cc21-4112-9114-1da21e48bc01\",
    \"admin_user_id\": \"6a226759-42b7-47b2-8490-67bc1e09bc48\",
    \"idempotency_key\": \"malicious-intent-key-token\"
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

The request is rejected before any portal interaction occurs, preserving tenant isolation and preventing unauthorized access.


# Security Features

* Cross-portal workflow validation
* End-to-end ecosystem dry-run engine
* Multi-tenant authorization
* Idempotent execution
* Duplicate request prevention
* Tenant data isolation
* Structured audit logging
* Persistent validation records
* Production-ready integration architecture

# Cross-Portal Validation Workflow

```text
Validation Request
        │
        ▼
Validate Payload
        │
        ▼
Verify Authorization
        │
        ▼
Check Idempotency Key
        │
        ├──────────────► Existing Validation
        │                  │
        │                  ▼
        │         Return Cached Result
        │
        ▼
Execute College Portal
        │
        ▼
Execute Student Portal
        │
        ▼
Execute Admin Console
        │
        ▼
Persist Validation Logs
        │
        ▼
Return Validation Summary
```


# Authorization Workflow

```text
Incoming Request
        │
        ▼
Read College ID
        │
        ▼
Read Officer ID
        │
        ▼
Verify College Membership
        │
        ├──────────────► Authorized
        │                  │
        │                  ▼
        │         Execute Validation
        │
        ▼
Unauthorized
        │
        ▼
Return 403 Forbidden
```
