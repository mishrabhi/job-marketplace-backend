# Intelligence Layer Integration & Model Governance Engine

This module implements the **Intelligence Layer Integration & Model Governance Engine** for the PlaceMux backend. It provides centralized governance for machine learning model serving through model version pinning, hard timeout enforcement, output contract validation, and automatic heuristic fallback strategies.

The platform ensures that intelligent ranking services remain reliable even when models become slow, unavailable, or produce invalid responses.


# Folder Structure

```text
phase3-task15-model-governance/
├── migrations/
│   └── 046_model_governance_tables.sql      # Model governance & policy schema
├── src/
│   ├── config/
│   │   ├── db.js                            # Database connection
│   │   ├── env.js                           # Environment configuration
│   │   └── logger.js                        # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                  # Global error handler
│   ├── validators/
│   │   └── governance.validator.js          # Request validation schemas
│   ├── controllers/
│   │   └── governance.controller.js         # Governance endpoints
│   ├── services/
│   │   └── governance.service.js            # Model governance engine
│   └── routes/
│       ├── governance.routes.js             # /api/v1/governance endpoints
│       └── index.js                         # Route registry
├── app.js                                   # Express application
├── server.js                                # Server bootstrap
├── package.json                             # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Model Governance Policies

The governance engine allows each intelligent application surface to define a serving policy.

Each policy includes:

- Surface Name
- Pinned Model Version
- Hard Timeout Threshold
- Fallback Strategy
- Deployment Metadata

This ensures every application surface consistently uses an approved model version.


## 2. Hard Timeout Enforcement

Every model invocation is executed within a configurable latency budget.

If execution exceeds the configured timeout:

- Model execution is terminated.
- A fallback strategy is triggered.
- The request completes successfully.
- Failure metadata is recorded.

This guarantees predictable response times under production load.


## 3. Output Contract Validation

Before model predictions are returned to the application, they are validated against an expected response schema.

If validation fails:

- Invalid predictions are discarded.
- The request falls back to the configured heuristic.
- The failure reason is logged.

This prevents malformed model outputs from reaching production users.


## 4. Heuristic Fallback Engine

Whenever the intelligent model cannot safely produce a result, the platform automatically falls back to a deterministic ranking strategy.

Supported fallback scenarios include:

- Model Timeout
- Invalid Output Format
- Internal Model Failure
- Deployment Errors

This maintains uninterrupted service availability.

# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/046_model_governance_tables.sql
```

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start Development Server

```bash
npm run dev
```


#  Evaluator Validation Guide

Configure the required environment variables.

```bash
export BASE=http://localhost:3009/api/v1

export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"

export CANDIDATE_1="4b111d42-ab12-4211-8224-2da21e48bc02"
export CANDIDATE_2="4b111d42-ab12-4211-8224-2da21e48bc03"
```

## Step 1 — Configure Model Governance Policy

```bash
curl -X POST "$BASE/governance/policies" \
  -H "Content-Type: application/json" \
  -d "{
    \"surface_name\": \"RECOMMENDATION_FEED\",
    \"pinned_version\": \"ltr_v2.0_stable\",
    \"hard_timeout_ms\": 150,
    \"fallback_strategy\": \"HEURISTIC_SCORE\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "policy_registered": true,
  "pinned_version": "ltr_v2.0_stable"
}
```

The serving policy is successfully registered for the specified application surface.


## Step 2 — Simulate a Slow Model

Verify that the hard timeout mechanism automatically activates the fallback strategy.

```bash
curl -X POST "$BASE/governance/invoke" \
  -H "Content-Type: application/json" \
  -d "{
    \"surface_name\": \"RECOMMENDATION_FEED\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"candidate_ids\": [
      \"$CANDIDATE_1\",
      \"$CANDIDATE_2\"
    ],
    \"simulation_mode\": \"MODEL_SLOW\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "used_fallback": true,
  "failure_mode": "MODEL_SLOW",
  "ranking_strategy": "HEURISTIC_SCORE"
}
```

The request exceeds the configured latency budget, causing the platform to automatically switch to the heuristic ranking engine.


## Step 3 — Simulate Invalid Model Output

Verify that malformed model responses are rejected and replaced by the configured fallback strategy.

```bash
curl -X POST "$BASE/governance/invoke" \
  -H "Content-Type: application/json" \
  -d "{
    \"surface_name\": \"RECOMMENDATION_FEED\",
    \"tenant_id\": \"$TENANT_UUID\",
    \"candidate_ids\": [
      \"$CANDIDATE_1\",
      \"$CANDIDATE_2\"
    ],
    \"simulation_mode\": \"MODEL_WRONG\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "used_fallback": true,
  "failure_mode": "MODEL_WRONG",
  "ranking_strategy": "HEURISTIC_SCORE"
}
```

The invalid model output fails contract validation and is replaced by the deterministic fallback ranking strategy.


#  Governance Features

- Model Version Pinning
- Hard Timeout Enforcement
- Output Contract Validation
- Automatic Heuristic Fallback
- Failure Mode Detection
- Deterministic Ranking Recovery
- Centralized Serving Policies
- Structured Audit Logging
- Production-ready Model Governance Platform


# Model Invocation Workflow

```text
Prediction Request
        │
        ▼
Load Serving Policy
        │
        ▼
Invoke Pinned Model
        │
        ▼
Check Timeout
        │
        ├────────────► Timeout
        │                  │
        │                  ▼
        │        Execute Fallback
        │
        ▼
Validate Output Contract
        │
        ├────────────► Invalid Output
        │                  │
        │                  ▼
        │        Execute Fallback
        │
        ▼
Return Valid Prediction
```


# Governance Policy Workflow

```text
Policy Configuration
        │
        ▼
Store Policy
        │
        ▼
Pin Model Version
        │
        ▼
Configure Timeout
        │
        ▼
Configure Fallback Strategy
        │
        ▼
Activate Policy
```


# Fallback Workflow

```text
Model Failure
      │
      ▼
Detect Failure Type
      │
      ├────────────► Timeout
      ├────────────► Invalid Output
      ├────────────► Internal Error
      │
      ▼
Execute Heuristic Ranking
      │
      ▼
Return Safe Response
      │
      ▼
Persist Failure Metadata
```
