# Incident Command & Triage Architecture

This module implements the **Incident Command & Triage Architecture** for the PlaceMux backend. It provides a centralized operational trust center for managing production incidents, ingesting defects, assigning engineering backlog items, and conducting blameless postmortem reviews.

The system is designed to support production operations by ensuring critical failures are tracked, triaged, and resolved through a structured incident management workflow.


# Folder Structure

```text
phase3-task1-incident-command/
├── migrations/
│   └── 033_incident_command_tables.sql      # Incident, defect & backlog schema
├── src/
│   ├── config/
│   │   ├── db.js                            # Database connection
│   │   ├── env.js                           # Environment configuration
│   │   └── logger.js                        # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                  # Global error handler
│   ├── validators/
│   │   └── sre.validator.js                 # Request validation schemas
│   ├── controllers/
│   │   └── sre.controller.js                # SRE endpoints
│   ├── services/
│   │   └── sre.service.js                   # Incident management engine
│   └── routes/
│       ├── sre.routes.js                    # /api/v1/sre endpoints
│       └── index.js                         # Route registry
├── app.js                                   # Express application
├── server.js                                # Server bootstrap
├── package.json                             # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Incident Command Center

The incident engine records production incidents as they occur.

Each incident captures:

* Incident Title
* Severity Level
* On-call Responder
* Current Status
* Created Timestamp
* Resolution Status

The API supports idempotent incident creation to prevent duplicate records during concurrent retries.

## 2. Defect Ingestion

Operational defects detected through monitoring systems can be ingested into the platform.

Each defect contains:

* Error Message
* Stack Trace
* Impacted Tenant
* Detection Timestamp
* Processing Status

This provides a centralized repository for production issues.


## 3. Engineering Backlog

Once a defect has been analyzed, engineering work items can be generated.

Each backlog entry includes:

* Task Title
* Engineering Owner
* Success Metrics
* Priority
* Assignment Timestamp

These records provide traceability between incidents and engineering improvements.


## 4. Blameless Postmortem

After an incident has been resolved, a postmortem record captures:

* Root Cause
* Preventative Actions
* Resolution Summary
* Closure Timestamp

This encourages continuous improvement while maintaining an auditable operational history.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration inside your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/033_incident_command_tables.sql
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

Configure the API base URL.

```bash
export BASE=http://localhost:3009/api/v1
```


## Step 1 — Trigger a Production Incident

```bash
curl -X POST "$BASE/sre/incidents/trigger" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Razorpay Webhook Delivery Queue Outage Burst",
    "severity": "SEV_1_CRITICAL",
    "on_call_responder": "6a226759-42b7-47b2-8490-67bc1e09bc48",
    "idempotency_key": "inc-event-token-unique-999"
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "incident_status": "OPEN",
  "severity": "SEV_1_CRITICAL"
}
```

If the same request is submitted again using the identical `idempotency_key`, the previously created incident is returned instead of creating a duplicate.


## Step 2 — Ingest a Production Defect

```bash
curl -X POST "$BASE/sre/defects/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "error_message": "Supabase connection pool exhausted under transactional lock query constraints",
    "stack_trace": "Error: Pool connection timeout\n    at Pool.connect (/src/config/db.js:12:4)",
    "impacted_tenant_id": "a1b23c44-dd55-66ee-77ff-88aa99bb0011"
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "defect_logged": true
}
```

The defect is persisted in the defect tracking repository for engineering review.


## Step 3 — Create an Engineering Backlog Item

```bash
curl -X POST "$BASE/sre/backlog/commit" \
  -H "Content-Type: application/json" \
  -d '{
    "task_title": "Migrate database pool orchestration connections to strict pg-bouncer allocations",
    "engineering_owner": "Alex Rivera (Lead DevOps Architect)",
    "bar_target_metrics": "Absorb concurrent threshold up to 1500 req/sec under 5% peak error boundaries",
    "idempotency_key": "backlog-token-assignment-101"
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "backlog_created": true
}
```

The engineering task is stored and linked to operational improvements.


## Step 4 — Complete a Blameless Postmortem

```bash
curl -X POST "$BASE/sre/incidents/postmortem" \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "<INSERT_YOUR_INCIDENT_UUID_FROM_STEP_1>",
    "root_cause": "Burst load caused simultaneous retry connections from webhook queues to exhaust local resource bounds.",
    "preventative_actions": [
      "Migrate connection logic to pg-bouncer pools",
      "Add strict API endpoint rate-limiting mechanisms"
    ]
  }'
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "incident_status": "CLOSED",
  "postmortem_recorded": true
}
```

The incident is marked as resolved, and the postmortem is permanently stored for future operational learning.


# Operational Features

* Incident Command Center
* Idempotent Incident Registration
* Production Defect Ingestion
* Engineering Backlog Management
* Blameless Postmortem Workflow
* Structured Audit Logging
* Persistent Incident History
* Production-ready SRE Architecture


# Incident Response Workflow

```text
Production Failure
        │
        ▼
Create Incident
        │
        ▼
Assign On-call Engineer
        │
        ▼
Log Defect
        │
        ▼
Generate Engineering Task
        │
        ▼
Implement Resolution
        │
        ▼
Record Postmortem
        │
        ▼
Close Incident
```


# Engineering Improvement Workflow

```text
Incident Created
        │
        ▼
Analyze Root Cause
        │
        ▼
Create Backlog Item
        │
        ▼
Assign Engineering Owner
        │
        ▼
Track Resolution
        │
        ▼
Verify Fix
        │
        ▼
Close Incident
```

