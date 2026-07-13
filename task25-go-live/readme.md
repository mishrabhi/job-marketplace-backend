# Production Go-Live Gateway & Cutover Checklist Engine 

This module implements the **Production Go-Live Gateway** and **Cutover Checklist Engine** for the PlaceMux backend. It validates final deployment readiness, executes production smoke checks, and records deployment sign-off information into persistent storage before the platform is released.

The module acts as the final operational gate, ensuring all critical deployment checkpoints are completed and audited prior to production launch.


# Folder Structure

```text id="eovlj8"
task25-production-cutover/
├── migrations/
│   └── 032_production_cutover_tables.sql    # Production checklist & deployment schema
├── src/
│   ├── config/
│   │   ├── db.js                            # Database connection
│   │   ├── env.js                           # Environment configuration
│   │   └── logger.js                        # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                  # Global error handler
│   ├── validators/
│   │   └── production.validator.js          # Request validation schemas
│   ├── controllers/
│   │   └── production.controller.js         # Production gateway endpoints
│   ├── services/
│   │   └── production.service.js            # Smoke checks & deployment engine
│   └── routes/
│       ├── production.routes.js             # /api/v1/production endpoints
│       └── index.js                         # Route registry
├── app.js                                   # Express application
├── server.js                                # Server bootstrap
├── package.json                             # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Production Go-Live Gateway

The Go-Live Gateway serves as the final validation checkpoint before deployment.

The gateway verifies:

* Service availability
* Database connectivity
* API health
* Critical dependencies
* Deployment readiness

Only when all required checks pass can the deployment proceed.


## 2. Cutover Checklist Engine

The cutover engine records every deployment activity performed during production launch.

Typical checklist items include:

* Infrastructure verification
* API smoke testing
* Database validation
* Service dependency checks
* Release approval
* Final deployment sign-off

Every completed checklist item is permanently stored for auditing purposes.

## 3. Deployment Validation Workflow

```text id="i1s4ui"
Deployment Request
        │
        ▼
Run Smoke Tests
        │
        ▼
Validate Infrastructure
        │
        ▼
Verify Dependencies
        │
        ▼
Complete Checklist
        │
        ▼
Persist Deployment Log
        │
        ▼
Approve Go-Live
```

This process ensures that production deployments occur only after all required validations have been successfully completed.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash id="fdf52w"
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/032_production_cutover_tables.sql
```


## 2. Install Dependencies

```bash id="6bexkh"
npm install
```


## 3. Start Development Server

```bash id="lh3kyg"
npm run dev
```

# Evaluator Validation Guide

Configure the required environment variables.

```bash id="xq4j5x"
export BASE=http://localhost:3009/api/v1
export RELEASE_ENGINEER_UUID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```


## Step 1 — Execute Production Smoke Checks

```bash id="3opjlwm"
curl -X POST "$BASE/production/go-live" \
  -H "Content-Type: application/json" \
  -d "{
    \"release_engineer_id\": \"$RELEASE_ENGINEER_UUID\",
    \"release_version\": \"v1.0.0\",
    \"environment\": \"production\",
    \"deployment_notes\": \"Final production smoke checks completed successfully.\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json id="mjlwm7"
{
  "success": true,
  "deployment_status": "READY_FOR_GO_LIVE",
  "smoke_checks": "PASSED"
}
```

The response confirms that all required smoke checks have passed and the deployment is approved for production.


## Step 2 — Record Production Cutover Checklist

```bash id="cf9gvy"
curl -X POST "$BASE/production/cutover/signoff" \
  -H "Content-Type: application/json" \
  -d "{
    \"release_engineer_id\": \"$RELEASE_ENGINEER_UUID\",
    \"checklist_status\": \"completed\",
    \"deployment_notes\": \"Infrastructure verified, APIs healthy, database synchronized and deployment approved.\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json id="kjlwm6"
{
  "success": true,
  "cutover_status": "SIGNED_OFF"
}
```

The production checklist is persisted, providing a permanent audit record of deployment approval.


# Security Features

* Production deployment validation
* Automated smoke testing
* Cutover checklist management
* Deployment audit logging
* Infrastructure verification
* Service dependency validation
* Persistent deployment records
* Production-ready release governance


# Go-Live Validation Workflow

```text id="wjlwm8"
Deployment Request
        │
        ▼
Run Smoke Checks
        │
        ▼
Verify Infrastructure
        │
        ▼
Validate Services
        │
        ▼
Approve Deployment
        │
        ▼
Persist Deployment Record
```

# Production Cutover Workflow

```text id="5jlwm9"
Deployment Approved
        │
        ▼
Complete Checklist
        │
        ▼
Record Sign-Off
        │
        ▼
Persist Audit Entry
        │
        ▼
Production Go-Live
```
