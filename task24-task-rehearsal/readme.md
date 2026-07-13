# Launch Rehearsal Bug-Bash Tracking & Data Retention Engine

This module implements the **Launch Rehearsal Bug-Bash Tracking** and **Data Retention Engine** for the PlaceMux backend. It enables administrators to track and resolve blockers discovered during launch rehearsals while enforcing automated data retention policies to remove obsolete records before production deployment.

The module helps ensure production readiness by combining operational issue management with lifecycle-based data cleanup.

# Folder Structure

```text id="yqt5sh"
task24-launch-rehearsal/
├── migrations/
│   └── 031_rehearsal_retention_tables.sql    # Bug-bash & data retention schema
├── src/
│   ├── config/
│   │   ├── db.js                             # Database connection
│   │   ├── env.js                            # Environment configuration
│   │   └── logger.js                         # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                   # Global error handler
│   ├── validators/
│   │   └── rehearsal.validator.js            # Request validation schemas
│   ├── controllers/
│   │   └── rehearsal.controller.js           # Bug-bash & retention endpoints
│   ├── services/
│   │   └── rehearsal.service.js              # Blocker management & retention engine
│   └── routes/
│       ├── rehearsal.routes.js               # /api/v1/rehearsal endpoints
│       └── index.js                          # Route registry
├── app.js                                    # Express application
├── server.js                                 # Server bootstrap
├── package.json                              # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Bug-Bash Tracking

The bug-bash engine tracks issues discovered during launch rehearsals.

Each blocker contains:

* Blocker ID
* Current Status
* Resolution Notes
* Resolution Timestamp
* Administrator Information

Administrators can mark blockers as resolved once fixes have been verified.


## 2. Data Retention Engine

The retention engine applies predefined cleanup policies to maintain database health.

Typical retention policies include:

* Expired draft offer removal
* Temporary data cleanup
* Audit log archival
* Obsolete session removal
* Scheduled maintenance pruning

Retention operations are recorded for auditing and operational transparency.


## 3. Operational Workflow

```text id="khqfpi"
Launch Rehearsal
        │
        ▼
Identify Blocker
        │
        ▼
Assign Resolution
        │
        ▼
Mark Blocker Cleared
        │
        ▼
Execute Retention Policy
        │
        ▼
Persist Audit Logs
```

This workflow ensures that launch blockers are resolved while obsolete data is removed before production deployment.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash id="5e5cm8"
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/031_rehearsal_retention_tables.sql
```


## 2. Install Dependencies

```bash id="gkjlwm"
npm install
```


## 3. Start Development Server

```bash id="dxv3cf"
npm run dev
```


#  Evaluator Validation Guide

Configure the required environment variables.

```bash id="lmj0qn"
export BASE=http://localhost:3009/api/v1
export ADMIN_OPERATOR_UUID="6a226759-42b7-47b2-8490-67bc1e09bc48"
```


## Step 1 — Clear a Bug-Bash Blocker

```bash id="vgxgzw"
curl -X POST "$BASE/rehearsal/blockers/clear" \
  -H "Content-Type: application/json" \
  -d "{
    \"blocker_id\": \"<insert-active-blocker-uuid>\",
    \"resolved_notes\": \"Pen-test path validation exception closed out. Validation sanitization patches applied strictly.\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json id="4bhwdf"
{
  "success": true,
  "blocker_status": "cleared"
}
```

Verify that the corresponding record has been updated with:

```text id="8nbwlx"
is_cleared = true
```

inside the bug-bash tracking table.


## Step 2 — Apply a Data Retention Policy

```bash id="x1ywkr"
curl -X POST "$BASE/rehearsal/retention/apply" \
  -H "Content-Type: application/json" \
  -d "{
    \"retention_policy\": \"PRUNE_EXPIRED_DRAFT_OFFERS\",
    \"operator_id\": \"$ADMIN_OPERATOR_UUID\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json id="bjlwmm"
{
  "success": true,
  "policy_executed": "PRUNE_EXPIRED_DRAFT_OFFERS"
}
```

The retention engine removes all eligible expired records and stores an execution log for auditing purposes.

# Security Features

* Bug-bash issue tracking
* Blocker resolution workflow
* Automated data retention policies
* Administrative operation logging
* Persistent audit records
* Structured validation
* Scheduled cleanup support
* Production-ready operational tooling


# Bug-Bash Resolution Workflow

```text id="j08d2u"
Bug Report
      │
      ▼
Validate Request
      │
      ▼
Locate Blocker
      │
      ▼
Record Resolution Notes
      │
      ▼
Update Blocker Status
      │
      ▼
Persist Audit Record
```


# Data Retention Workflow

```text id="ytqln7"
Retention Request
        │
        ▼
Validate Policy
        │
        ▼
Identify Eligible Records
        │
        ▼
Prune Expired Data
        │
        ▼
Record Retention Log
        │
        ▼
Return Execution Summary
```
