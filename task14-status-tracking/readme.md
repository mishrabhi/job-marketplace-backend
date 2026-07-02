# End-to-End Status Tracking & Unified State Transition Ledger

This module implements a centralized **Status Tracking Engine** and **Unified State Transition Ledger** for the PlaceMux backend. It records every application status transition from payment initiation through recruitment, interview scheduling, offer generation, digital signing, and final onboarding, creating a complete and auditable lifecycle history.


# Folder Structure

```text id="j6w8ah"
task14-status-tracking/
├── migrations/
│   └── 021_status_tracking_tables.sql     # Status tracking & transition ledger schema
├── src/
│   ├── config/
│   │   ├── db.js                          # Database connection
│   │   ├── env.js                         # Environment configuration
│   │   └── logger.js                      # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                # Global error handler
│   ├── validators/
│   │   └── tracking.validator.js          # Request validation schemas
│   ├── controllers/
│   │   └── tracking.controller.js         # Status tracking endpoints
│   ├── services/
│   │   └── tracking.service.js            # State transition & timeline engine
│   └── routes/
│       ├── tracking.routes.js             # /api/v1/tracking endpoints
│       └── index.js                       # Route registry
├── app.js                                 # Express application
├── server.js                              # Server bootstrap
├── package.json                           # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Unified State Transition Engine

Every application moves through a predefined lifecycle.

Typical workflow:

```text id="3nn8p0"
Payment Completed
        │
        ▼
Application Submitted
        │
        ▼
Shortlisted
        │
        ▼
Interview Scheduled
        │
        ▼
Interview Completed
        │
        ▼
Offer Generated
        │
        ▼
Offer Signed
        │
        ▼
Hired
```

Each transition is recorded in a centralized ledger to provide a complete audit trail.


## 2. Atomic Status Updates

Status updates are performed atomically.

Each transition records:

* Application ID
* Previous Status
* Current Status
* Changed By
* Timestamp
* Reason Note

This guarantees that every workflow change is fully traceable and prevents inconsistent application states.


## 3. Timeline Ledger

The timeline endpoint reconstructs the complete lifecycle of an application by retrieving every recorded state transition in chronological order.

The ledger provides:

* Historical status changes
* Transition timestamps
* User responsible for each update
* Optional change notes

This creates a comprehensive audit history for recruiters, administrators, and compliance reviews.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash id="w1fdmf"
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/021_status_tracking_tables.sql
```


## 2. Install Dependencies

```bash id="cpr4na"
npm install
```


## 3. Start Development Server

```bash id="1vwrpf"
npm run dev
```


# Evaluator Verification Guide

Configure the required environment variables.

```bash id="vtj9pp"
export BASE=http://localhost:3009/api/v1
export APP_UUID="<insert-target-application-uuid-token>"
```


## Step 1 — Update Application Status

```bash id="0rmzrl"
curl -X POST "$BASE/tracking/update" \
  -H "Content-Type: application/json" \
  -d "{
    \"application_id\": \"$APP_UUID\",
    \"new_status\": \"shortlisted\",
    \"changed_by\": \"3a226759-42b7-47b2-8490-67bc1e09bc33\",
    \"reason_note\": \"Candidate matched filtering benchmarks after structural baseline examination.\"
  }"
```

### Expected Result

Returns **HTTP 200 OK** with a response similar to:

```json id="wp7v7x"
{
  "success": true,
  "previous_status": "applied",
  "current_status": "shortlisted"
}
```

The application record is updated and a new entry is inserted into the transition ledger.


## Step 2 — Retrieve Complete Timeline

```bash id="q9oq4v"
curl -X GET "$BASE/tracking/timeline?application_id=$APP_UUID"
```

### Expected Result

Returns the complete chronological history of the application.

Example:

```json id="jvh2gr"
{
  "application_id": "<application-id>",
  "timeline": [
    {
      "status": "payment_completed",
      "timestamp": "...",
      "changed_by": "system"
    },
    {
      "status": "applied",
      "timestamp": "...",
      "changed_by": "student"
    },
    {
      "status": "shortlisted",
      "timestamp": "...",
      "changed_by": "recruiter"
    }
  ]
}
```

This provides a fully auditable record of every workflow transition associated with the application.


# Tracking Features

* Centralized application tracking
* Atomic state transitions
* Immutable transition ledger
* Complete audit timeline
* Historical status reconstruction
* User attribution for every change
* Timestamped workflow history
* Structured audit logging


# Status Transition Workflow

```text id="jbmfm4"
Application Created
        │
        ▼
Validate Status Transition
        │
        ▼
Update Application Status
        │
        ▼
Insert Transition Record
        │
        ▼
Persist Ledger Entry
        │
        ▼
Return Updated Status
```


# Timeline Retrieval Workflow

```text id="jqkmlz"
Application ID
        │
        ▼
Fetch Ledger Entries
        │
        ▼
Sort by Timestamp
        │
        ▼
Build Timeline
        │
        ▼
Return Complete Audit History
```



