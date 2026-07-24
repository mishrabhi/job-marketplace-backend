# Experimentation Platform, Feature Flags & Guardrails Engine 

This module implements the **Experimentation Platform, Feature Flags & Guardrails Engine** for the PlaceMux backend. It enables controlled feature rollouts through deterministic sticky variant assignments, server-side exposure tracking, configurable traffic allocation, and instant kill switches without requiring application redeployment.

The platform allows engineering teams to safely experiment with new features while minimizing operational risk and ensuring a consistent user experience.


# Folder Structure

```text
phase3-task9-feature-flags/
├── migrations/
│   └── 040_feature_flag_tables.sql         # Feature flags & experimentation schema
├── src/
│   ├── config/
│   │   ├── db.js                           # Database connection
│   │   ├── env.js                          # Environment configuration
│   │   └── logger.js                       # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                 # Global error handler
│   ├── validators/
│   │   └── featureFlag.validator.js        # Request validation schemas
│   ├── controllers/
│   │   └── featureFlag.controller.js       # Feature flag endpoints
│   ├── services/
│   │   └── featureFlag.service.js          # Experimentation engine
│   └── routes/
│       ├── featureFlag.routes.js           # /api/v1/flags endpoints
│       └── index.js                        # Route registry
├── app.js                                  # Express application
├── server.js                               # Server bootstrap
├── package.json                            # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Feature Flag Management

The experimentation engine allows administrators to register and manage feature flags.

Each feature flag contains:

- Feature Key
- Description
- Variants
- Traffic Allocation
- Owner
- Status
- Created Timestamp


## 2. Sticky Variant Assignment

Each user receives a deterministic variant assignment.

The assignment guarantees:

- Consistent user experience
- Deterministic hashing
- Sticky experiments
- Server-side exposure tracking

A user will always receive the same variant until the experiment configuration changes.


## 3. Kill Switch

The platform supports an immediate feature disable mechanism.

Benefits include:

- Zero application redeployment
- Immediate rollback
- Safe production recovery
- Automatic fallback to control group


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/040_feature_flag_tables.sql
```


## 2. Install Dependencies

```bash
npm install
```


## 3. Start Development Server

```bash
npm run dev
```


#  Evaluator Validation Guide

Configure the required environment variables.

```bash
export BASE=http://localhost:3009/api/v1

export USER_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
```


## Step 1 — Register a Feature Flag

```bash
curl -X POST "$BASE/flags/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"flag_key\": \"RECOMMENDATION_ENGINE_V2\",
    \"description\": \"New ML-based recommendation engine evaluation\",
    \"variants\": [\"control\", \"treatment_a\", \"treatment_b\"],
    \"traffic_allocation\": 100,
    \"owner_email\": \"lead.engineer@placemux.com\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "flag_registered": true
}
```

The feature flag is successfully created and becomes available for evaluation.


## Step 2 — Evaluate a Feature Flag

Evaluate the feature flag for the same user multiple times.

```bash
curl -X POST "$BASE/flags/evaluate" \
  -H "Content-Type: application/json" \
  -d "{
    \"flag_key\": \"RECOMMENDATION_ENGINE_V2\",
    \"user_id\": \"$USER_UUID\",
    \"tenant_id\": \"$TENANT_UUID\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "variant": "treatment_a",
  "is_kill_switch_active": false
}
```

Repeated evaluations for the same user always return the same variant, demonstrating deterministic sticky assignment.


## Step 3 — Activate Kill Switch

Disable the feature without redeploying the application.

```bash
curl -X POST "$BASE/flags/kill-switch" \
  -H "Content-Type: application/json" \
  -d "{
    \"flag_key\": \"RECOMMENDATION_ENGINE_V2\",
    \"is_active\": false
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "kill_switch_enabled": true
}
```

The feature flag is immediately disabled for all users.


## Step 4 — Verify Graceful Fallback

Re-evaluate the feature after enabling the kill switch.

```bash
curl -X POST "$BASE/flags/evaluate" \
  -H "Content-Type: application/json" \
  -d "{
    \"flag_key\": \"RECOMMENDATION_ENGINE_V2\",
    \"user_id\": \"$USER_UUID\",
    \"tenant_id\": \"$TENANT_UUID\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "variant": "control",
  "is_kill_switch_active": true
}
```

The evaluation automatically falls back to the **control** variant, demonstrating an immediate rollback without redeployment.


# Experimentation Features

- Feature Flag Management
- Sticky Variant Assignment
- Deterministic User Bucketing
- Traffic Allocation Control
- Server-side Exposure Tracking
- Instant Kill Switch
- Graceful Feature Rollback
- Persistent Experiment Tracking
- Production-ready Experimentation Platform

# Feature Evaluation Workflow

```text
Evaluation Request
        │
        ▼
Validate Feature Flag
        │
        ▼
Check Kill Switch
        │
        ├────────────► Enabled
        │                  │
        │                  ▼
        │         Return Control Variant
        │
        ▼
Calculate Sticky Assignment
        │
        ▼
Record Exposure
        │
        ▼
Return Assigned Variant
```

# Kill Switch Workflow

```text
Administrator Request
        │
        ▼
Update Feature Status
        │
        ▼
Persist Configuration
        │
        ▼
Immediately Disable Feature
        │
        ▼
Serve Control Variant
```
