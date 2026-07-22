# Activation & Onboarding Funnel Optimization Engine

This module implements the **Activation & Onboarding Funnel Optimization Engine** for the PlaceMux backend. It streamlines candidate onboarding by providing fast account creation, intelligent input normalization, asynchronous onboarding workflows, actionable error handling, and activation funnel analytics.

The system is designed to maximize successful user onboarding while maintaining excellent user experience and operational visibility.


# Folder Structure

```text
phase3-task7-activation-funnel/
├── migrations/
│   └── 038_activation_funnel_tables.sql      # Activation & onboarding schema
├── src/
│   ├── config/
│   │   ├── db.js                             # Database connection
│   │   ├── env.js                            # Environment configuration
│   │   └── logger.js                         # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                   # Global error handler
│   ├── validators/
│   │   └── activation.validator.js           # Request validation schemas
│   ├── controllers/
│   │   └── activation.controller.js          # Activation endpoints
│   ├── services/
│   │   └── activation.service.js             # Signup & onboarding engine
│   └── routes/
│       ├── activation.routes.js              # /api/v1/activation endpoints
│       └── index.js                          # Route registry
├── app.js                                    # Express application
├── server.js                                 # Server bootstrap
├── package.json                              # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Fast Candidate Activation

The activation engine provides a streamlined signup experience.

Features include:

- Fast account creation
- Input normalization
- Duplicate account detection
- Idempotent request handling
- Asynchronous onboarding

Non-critical onboarding operations are deferred to background jobs to minimize signup latency.

## 2. Intelligent Input Normalization

Before creating an account, user input is automatically normalized.

Examples include:

- Removing leading/trailing spaces
- Converting email addresses to lowercase
- Standardizing user input

This improves usability while preventing duplicate registrations caused by inconsistent formatting.


## 3. Activation Funnel Analytics

The platform continuously measures onboarding performance.

Metrics include:

- Successful activations
- Failed signups
- Average onboarding latency
- Activation success rate
- Tenant-specific onboarding statistics

These insights help optimize the onboarding experience.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/038_activation_funnel_tables.sql
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
export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
```


## Step 1 — Execute Candidate Signup

The email intentionally contains uppercase letters and extra spaces to demonstrate automatic normalization.

```bash
curl -X POST "$BASE/activation/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"  ALEX.RIVERA2026@UNIVERSITY.EDU   \",
    \"full_name\": \"Alex Rivera\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"idempotency_key\": \"act-signup-token-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "user_created": true,
  "normalized_email": "alex.rivera2026@university.edu",
  "background_job": "queued"
}
```

The response confirms that:

- The email has been normalized.
- The account has been created.
- Heavy onboarding operations have been delegated to asynchronous background jobs.


## Step 2 — Verify Duplicate Email Handling

Attempt to register the same email again.

```bash
curl -X POST "$BASE/activation/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"alex.rivera2026@university.edu\",
    \"full_name\": \"Alex Rivera\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"idempotency_key\": \"act-signup-token-002\"
  }"
```

### Expected Result

Returns **HTTP 409 Conflict**.

Example response:

```json
{
  "success": false,
  "error_code": "DUPLICATE_EMAIL",
  "message": "An account with this email already exists. Try signing in or resetting your password."
}
```

The system provides a clear and actionable error message instead of a generic failure.


## Step 3 — View Activation Funnel Metrics

```bash
curl -X GET "$BASE/activation/metrics?tenant_id=$TENANT_UUID"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "activation_success_rate": 97.8,
  "average_onboarding_latency_ms": 135,
  "total_signups": 150
}
```

The response provides tenant-specific onboarding metrics and activation performance statistics.


# Activation Features

- Fast candidate signup
- Email normalization
- Input sanitization
- Idempotent registration
- Duplicate account detection
- Background onboarding jobs
- Actionable error responses
- Activation funnel analytics
- Production-ready onboarding architecture


# Candidate Signup Workflow

```text
Signup Request
       │
       ▼
Normalize Input
       │
       ▼
Validate Payload
       │
       ▼
Check Duplicate Email
       │
       ├────────────► Duplicate Found
       │                  │
       │                  ▼
       │         Return 409 Conflict
       │
       ▼
Create User
       │
       ▼
Queue Background Jobs
       │
       ▼
Return Success
```

# Activation Analytics Workflow

```text
User Signup
       │
       ▼
Record Activation
       │
       ▼
Measure Latency
       │
       ▼
Update Funnel Metrics
       │
       ▼
Persist Analytics
       │
       ▼
Expose Dashboard Metrics
```
