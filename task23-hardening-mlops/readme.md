# API Surface Hardening, Traffic Protection & MLOps Telemetry Matrix

This module implements the **API Surface Hardening**, **Traffic Protection**, and **MLOps Telemetry Matrix** for the PlaceMux backend. It provides sliding-window rate limiting to protect APIs against abuse while recording machine learning inference telemetry for monitoring, debugging, and model performance analysis.

The system is designed to improve platform reliability under high traffic while maintaining detailed operational insights into AI model execution.


# Folder Structure

```text
task23-api-hardening/
├── migrations/
│   └── 030_mlops_hardening_tables.sql      # Rate limiting & telemetry schema
├── src/
│   ├── config/
│   │   ├── db.js                           # Database connection
│   │   ├── env.js                          # Environment configuration
│   │   └── logger.js                       # Structured logging
│   ├── middlewares/
│   │   ├── errorHandler.js                 # Global error handler
│   │   └── rateLimiter.js                  # Sliding-window rate limiter
│   ├── validators/
│   │   └── mlops.validator.js              # Request validation schemas
│   ├── controllers/
│   │   └── mlops.controller.js             # MLOps telemetry endpoints
│   ├── services/
│   │   └── mlops.service.js                # Inference logging & telemetry engine
│   └── routes/
│       ├── hardening.routes.js             # /api/v1/hardening endpoints
│       └── index.js                        # Route registry
├── app.js                                  # Express application
├── server.js                               # Server bootstrap
├── package.json                            # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. API Surface Hardening

The API layer is protected using a **sliding-window rate limiter**.

The protection engine:

* Tracks incoming requests per client.
* Limits excessive request bursts.
* Prevents API abuse.
* Protects backend resources from overload.

Once the request threshold is exceeded, subsequent requests are rejected until the sliding window resets.


## 2. MLOps Inference Telemetry

Every AI inference request is logged to support model monitoring and operational analytics.

Each telemetry record includes:

* Model Name
* Model Version
* Student ID
* Input Features
* Prediction Output
* Inference Latency
* Timestamp

These logs enable model performance evaluation and production debugging.


## 3. Traffic Protection Workflow

```text
Incoming Request
        │
        ▼
Sliding Window Check
        │
        ├────────────► Limit Exceeded
        │                  │
        │                  ▼
        │          Return HTTP 429
        │
        ▼
Process Request
        │
        ▼
Execute Business Logic
        │
        ▼
Persist Telemetry
        │
        ▼
Return Response
```


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/030_mlops_hardening_tables.sql
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
export CANDIDATE_STUDENT_UUID="4b111d42-ab12-4211-8224-2da21e48bc02"
```

## Step 1 — Log an MLOps Inference

```bash
curl -X POST "$BASE/hardening/mlops/inference" \
  -H "Content-Type: application/json" \
  -d "{
    \"model_name\": \"recommendation_v1\",
    \"model_version\": \"v1.0.4\",
    \"student_id\": \"$CANDIDATE_STUDENT_UUID\",
    \"features_payload\": {
      \"completed_applications\": 4,
      \"skills_vector\": [
        \"NodeJS\",
        \"Postgres\"
      ]
    },
    \"prediction_output\": {
      \"recommended_roles\": [
        \"Backend Associate\",
        \"Systems Architect\"
      ]
    },
    \"latency_ms\": 45
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "telemetry_logged": true
}
```

Verify that the inference record has been persisted inside the `mlops_inference_logs` table.

---

## Step 2 — Verify Sliding Window Rate Limiting

Execute multiple requests in rapid succession.

```bash
for i in {1..105}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
  "$BASE/hardening/mlops/inference"
done
```

### Expected Result

* Initial requests return **HTTP 200 OK**.
* Requests exceeding the configured threshold return:

```http
429 Too Many Requests
```

This confirms that the sliding-window protection mechanism is actively preventing excessive traffic.


# Security Features

* Sliding-window rate limiting
* API traffic protection
* Burst request throttling
* MLOps inference telemetry
* Model performance logging
* Latency monitoring
* Structured operational logging
* Persistent telemetry storage
* Production-ready API protection


# MLOps Telemetry Workflow

```text
Inference Request
        │
        ▼
Validate Payload
        │
        ▼
Execute ML Model
        │
        ▼
Capture Prediction
        │
        ▼
Log Telemetry
        │
        ▼
Persist Database Record
        │
        ▼
Return Response
```

# Rate Limiting Workflow

```text
Incoming Request
        │
        ▼
Read Client Identifier
        │
        ▼
Evaluate Sliding Window
        │
        ├────────────► Threshold Exceeded
        │                  │
        │                  ▼
        │          Return HTTP 429
        │
        ▼
Allow Request
        │
        ▼
Continue Processing
```


