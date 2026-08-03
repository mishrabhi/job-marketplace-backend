# Enterprise Readiness Integration & Pilot Dry-Run Engine 

This module implements the **Enterprise Readiness Integration & Pilot Dry-Run Engine** for the PlaceMux backend. It automates enterprise pilot tenant provisioning, executes end-to-end enterprise workflow validation, and manages a remediation register to ensure production readiness before go-live.

The platform enables organizations to simulate real enterprise deployments, validate critical integrations such as SSO and ATS connectivity, identify operational gaps, and determine whether a tenant is ready for production rollout.


# Folder Structure

```text
phase3-task20-enterprise-pilot/
├── migrations/
│   └── 051_enterprise_pilot_remediation.sql      # Pilot provisioning & remediation schema
├── src/
│   ├── config/
│   │   ├── db.js                            # Database connection
│   │   ├── env.js                           # Environment configuration
│   │   └── logger.js                        # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                  # Global error handler
│   ├── validators/
│   │   └── pilot.validator.js     # Request validation schemas
│   ├── controllers/
│   │   └── pilot.controller.js    # Enterprise pilot endpoints
│   ├── services/
│   │   └── pilot.service.js       # Pilot orchestration engine
│   └── routes/
│       ├── pilot.routes.js        # /api/v1/enterprise-pilot endpoints
│       └── index.js                         # Route registry
├── app.js                                   # Express application
├── server.js                                # Server bootstrap
├── package.json                             # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Pilot Tenant Provisioning

The engine provisions enterprise pilot environments by configuring all required integrations.

Provisioning includes:

- Tenant Registration
- Enterprise SSO Configuration
- ATS Partner Configuration
- Default Enterprise Policies
- Operational Metadata

Each tenant is fully prepared for pilot testing.


## 2. End-to-End Pilot Journey

The platform executes enterprise workflows across integrated systems to validate operational readiness.

Supported journey actions include:

- ATS Webhook Dispatch
- Authentication Validation
- Candidate Workflow Execution
- Integration Health Checks
- Event Processing

Each execution is idempotent and logged for auditing.


## 3. Remediation Register

Before production rollout, any identified issues are recorded in the remediation register.

Each remediation item contains:

- Title
- Severity
- Category
- Resolution Status
- Audit Metadata

This ensures that all deployment blockers are tracked before go-live.


## 4. Go-Live Readiness Assessment

The engine continuously evaluates pilot health by summarizing remediation status.

Readiness metrics include:

- Total Open Issues
- Critical Issues
- Resolved Items
- Overall Go-Live Status

Only tenants meeting all readiness criteria are marked as production-ready.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/051_enterprise_pilot_tables.sql
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
export BASE=http://localhost:3009/api/v1/enterprise-pilot

export PILOT_TENANT="a1b23c44-dd55-66ee-77ff-88aa99bb0011"

export CANDIDATE_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
```


## Step 1 — Provision a Pilot Enterprise Tenant

```bash
curl -X POST "$BASE/pilot/provision" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$PILOT_TENANT\",
    \"pilot_name\": \"Acme Corp Enterprise Pilot\",
    \"sso_login_url\": \"https://idp.acme.com/sso/login\",
    \"ats_partner_key\": \"pk_sandbox_acme_12345\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "pilot_provisioned": true,
  "tenant_ready": true
}
```

The pilot tenant is successfully provisioned with enterprise SSO configuration and ATS integration credentials.


## Step 2 — Execute an End-to-End Pilot Journey

```bash
curl -X POST "$BASE/pilot/journey/execute" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$PILOT_TENANT\",
    \"candidate_id\": \"$CANDIDATE_UUID\",
    \"action_type\": \"ATS_WEBHOOK_DISPATCH\",
    \"idempotency_key\": \"pilot-journey-token-001\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "status": "SUCCESSFUL"
}
```

The selected enterprise workflow executes successfully, validating the configured integrations.


## Step 3 — Register a Remediation Item

```bash
curl -X POST "$BASE/pilot/remediation/items" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$PILOT_TENANT\",
    \"gap_title\": \"ATS Webhook Retry Backoff Threshold Optimization\",
    \"severity\": \"MEDIUM\",
    \"category\": \"INTEGRATION\",
    \"idempotency_key\": \"pilot-rem-item-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "remediation_item_created": true
}
```

The remediation item is successfully recorded and becomes part of the tenant's go-live checklist.


## Step 4 — Retrieve the Remediation Summary

```bash
curl -X GET "$BASE/pilot/remediation/summary?tenant_id=$PILOT_TENANT"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "critical_unresolved_gaps": 0,
  "ready_for_go_live": true
}
```

The summary confirms that all critical issues have been resolved and the tenant is ready for production deployment.


# Enterprise Pilot Features

- Automated Pilot Tenant Provisioning
- Enterprise SSO Configuration
- ATS Partner Integration
- End-to-End Workflow Validation
- Idempotent Journey Execution
- Remediation Register
- Go-Live Readiness Assessment
- Structured Audit Logging
- Production-ready Enterprise Pilot Platform


# Pilot Provisioning Workflow

```text
Provision Request
        │
        ▼
Create Tenant
        │
        ▼
Configure Enterprise SSO
        │
        ▼
Configure ATS Partner
        │
        ▼
Initialize Enterprise Policies
        │
        ▼
Provision Complete
```


# Enterprise Journey Workflow

```text
Journey Request
       │
       ▼
Validate Tenant
       │
       ▼
Execute Workflow
       │
       ▼
Verify Integrations
       │
       ▼
Persist Execution Logs
       │
       ▼
Return Result
```


# Go-Live Readiness Workflow

```text
Pilot Assessment
        │
        ▼
Collect Remediation Items
        │
        ▼
Evaluate Critical Issues
        │
        ▼
Generate Readiness Report
        │
        ▼
Mark Ready for Go-Live
```
