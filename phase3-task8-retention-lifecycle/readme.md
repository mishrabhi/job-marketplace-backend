# Retention, Cohorts & Churn Lifecycle Engine 

This module implements the **Retention, Cohort Analysis & Churn Lifecycle Engine** for the PlaceMux backend. It manages user lifecycle states, tracks engagement patterns, respects **DPDP consent preferences**, and dispatches idempotent, rate-limited re-engagement notifications.

The system enables intelligent retention strategies while ensuring that user communication complies with privacy regulations and duplicate notifications are never sent.


# Folder Structure

```text
phase3-task8-retention-engine/
├── migrations/
│   └── 039_retention_lifecycle_tables.sql     # Retention & notification schema
├── src/
│   ├── config/
│   │   ├── db.js                              # Database connection
│   │   ├── env.js                             # Environment configuration
│   │   └── logger.js                          # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                    # Global error handler
│   ├── validators/
│   │   └── retention.validator.js             # Request validation schemas
│   ├── controllers/
│   │   └── retention.controller.js            # Retention endpoints
│   ├── services/
│   │   └── retention.service.js               # Lifecycle & notification engine
│   └── routes/
│       ├── retention.routes.js                # /api/v1/retention endpoints
│       └── index.js                           # Route registry
├── app.js                                     # Express application
├── server.js                                  # Server bootstrap
├── package.json                               # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. User Lifecycle Management

The lifecycle engine continuously tracks each user's engagement journey.

Supported lifecycle states include:

- New User
- Active
- Engaged
- At Risk
- Churned
- Re-engaged

Each transition is recorded with timestamps for retention analysis.


## 2. DPDP-Aware Notifications

Before sending any engagement notification, the system verifies the user's consent.

Validation includes:

- DPDP consent availability
- Notification channel eligibility
- User lifecycle state
- Rate-limit verification

If consent has not been granted, the notification is blocked automatically.


## 3. Idempotent Notification Delivery

Every notification request requires a unique:

```text
idempotency_key
```

The platform guarantees:

- Duplicate notification requests are never processed twice.
- Previously processed requests are returned from cache.
- Users never receive duplicate engagement messages.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/039_retention_lifecycle_tables.sql
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

export USER_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
```

## Step 1 — Update User Lifecycle State

```bash
curl -X POST "$BASE/retention/lifecycle/state" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_UUID\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"lifecycle_state\": \"at_risk\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "lifecycle_state": "at_risk",
  "updated": true
}
```

Verify that the user's lifecycle state has been updated to **at_risk** along with the latest timestamp.

## Step 2 — Attempt Notification Without DPDP Consent

```bash
curl -X POST "$BASE/retention/notifications/trigger" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_UUID\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"notification_type\": \"RE_ENGAGEMENT_NUDGE\",
    \"channel\": \"email\",
    \"idempotency_key\": \"notif-token-test-001\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "status": "BLOCKED_NO_DPDP_CONSENT"
}
```

The notification is not dispatched because the user has not granted consent in the DPDP consent registry.


## Step 3 — Verify Notification Idempotency

Trigger the exact same request again using the same idempotency key.

```bash
curl -X POST "$BASE/retention/notifications/trigger" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_UUID\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"notification_type\": \"RE_ENGAGEMENT_NUDGE\",
    \"channel\": \"email\",
    \"idempotency_key\": \"notif-token-test-001\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "status": "RESOLVED_FROM_IDEMPOTENCY_CACHE"
}
```

The request is resolved from the idempotency cache, guaranteeing that duplicate notifications are never delivered.


# Retention Features

- User lifecycle tracking
- Cohort-based engagement management
- Churn detection
- DPDP consent verification
- Rate-limited notifications
- Idempotent notification delivery
- Duplicate notification prevention
- Tenant-aware retention analytics
- Production-ready retention architecture

# Lifecycle Management Workflow

```text
User Activity
      │
      ▼
Evaluate Engagement
      │
      ▼
Assign Lifecycle State
      │
      ▼
Persist State
      │
      ▼
Update Retention Metrics
```

# Notification Workflow

```text
Notification Request
        │
        ▼
Validate Payload
        │
        ▼
Verify DPDP Consent
        │
        ├────────────► Consent Missing
        │                  │
        │                  ▼
        │      Block Notification
        │
        ▼
Check Idempotency
        │
        ├────────────► Cached Request
        │                  │
        │                  ▼
        │      Return Cached Result
        │
        ▼
Dispatch Notification
        │
        ▼
Persist Delivery Log
```

# Retention Analytics Workflow

```text
User Events
      │
      ▼
Track Lifecycle
      │
      ▼
Calculate Cohorts
      │
      ▼
Detect Churn Risk
      │
      ▼
Trigger Re-engagement
      │
      ▼
Update Analytics
```
