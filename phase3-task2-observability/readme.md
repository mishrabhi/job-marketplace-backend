# OpenTelemetry Core Span Ingestion & SLO Dashboard Platform

This module implements the **OpenTelemetry Core Span Ingestion** and **Service Level Objective (SLO) Dashboard Platform** for the PlaceMux backend. It provides distributed tracing support, latency monitoring, span ingestion, and error budget tracking to measure application reliability and operational health.

The platform enables real-time observability by collecting request spans, evaluating them against predefined SLO targets, and exposing dashboards for monitoring latency, availability, and error budget consumption.


# Folder Structure

```text
phase3-task2-observability/
├── migrations/
│   └── 034_observability_tables.sql        # OpenTelemetry & SLO schema
├── src/
│   ├── config/
│   │   ├── db.js                           # Database connection
│   │   ├── env.js                          # Environment configuration
│   │   └── logger.js                       # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                 # Global error handler
│   ├── validators/
│   │   └── observability.validator.js      # Request validation schemas
│   ├── controllers/
│   │   └── observability.controller.js     # Telemetry endpoints
│   ├── services/
│   │   └── observability.service.js        # Span ingestion & SLO engine
│   └── routes/
│       ├── observability.routes.js         # /api/v1/observability endpoints
│       └── index.js                        # Route registry
├── app.js                                  # Express application
├── server.js                               # Server bootstrap
├── package.json                            # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Distributed Span Ingestion

The observability engine captures request traces across backend services.

Each span records:

* Trace ID
* Span ID
* Parent Span ID
* Endpoint Path
* HTTP Method
* Latency
* Status Code
* Tenant ID
* Timestamp

This information enables complete distributed request tracing.


## 2. Service Level Objectives (SLO)

Each monitored endpoint has an associated SLO profile.

Typical metrics include:

* Target Latency
* Availability Target
* Total Error Budget
* Remaining Budget
* Consumed Budget

Incoming requests are automatically evaluated against these thresholds.


## 3. Error Budget Monitoring

Whenever an endpoint exceeds its configured latency target, the platform records an SLO breach.

The dashboard continuously tracks:

* Successful Requests
* Slow Requests
* Error Budget Consumption
* Remaining Budget
* Overall Endpoint Health

This enables engineering teams to monitor operational reliability in real time.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration inside your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/034_observability_tables.sql
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


## Seed Initial SLO Profile

Before ingesting telemetry spans, insert a baseline SLO profile into the database.

```sql
INSERT INTO endpoint_slo_profiles (
    endpoint_path,
    target_latency_ms,
    availability_target,
    total_budget_tokens,
    spent_budget_tokens
)
VALUES (
    '/api/v1/payments/capture',
    200,
    99.50,
    100,
    0
)
ON CONFLICT DO NOTHING;
```

This establishes the latency and error budget targets for the monitored endpoint.


## Step 1 — Ingest a Telemetry Span

```bash
curl -X POST "$BASE/observability/telemetry/spans" \
  -H "Content-Type: application/json" \
  -d '{
    "trace_id": "trace-99999999-aaaa-bbbb-cccc-dddddddddddd",
    "span_id": "span-11111111",
    "parent_span_id": null,
    "endpoint_path": "/api/v1/payments/capture",
    "http_method": "POST",
    "latency_ms": 450,
    "status_code": 200,
    "tenant_id": "a1b23c44-dd55-66ee-77ff-88aa99bb0011"
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "slo_status": "SLO_BREACH_RECORDED"
}
```

Since the request latency (**450 ms**) exceeds the configured SLO target (**200 ms**), the system records an SLO breach and updates the endpoint's error budget.


## Step 2 — View the SLO Dashboard

```bash
curl -X GET "$BASE/observability/budget/dashboard?endpoint_path=%2Fapi%2Fv1%2Fpayments%2Fcapture"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "endpoint": "/api/v1/payments/capture",
  "target_latency_ms": 200,
  "remaining_budget_tokens": 99,
  "spent_budget_tokens": 1,
  "availability_target": 99.5
}
```

The dashboard displays the endpoint's current Service Level Objective status and remaining error budget.


# Observability Features

* OpenTelemetry span ingestion
* Distributed request tracing
* Endpoint latency monitoring
* Service Level Objective (SLO) tracking
* Error budget management
* Real-time observability dashboards
* Persistent telemetry storage
* Structured operational logging
* Production-ready monitoring architecture



#  Span Ingestion Workflow

```text
Incoming Request
        │
        ▼
Capture Trace
        │
        ▼
Create Span
        │
        ▼
Persist Telemetry
        │
        ▼
Evaluate SLO
        │
        ▼
Update Error Budget
        │
        ▼
Return Response
```


# SLO Monitoring Workflow

```text
Telemetry Span
        │
        ▼
Read Endpoint Profile
        │
        ▼
Compare Latency
        │
        ├────────────► Within Target
        │                  │
        │                  ▼
        │          Budget Unchanged
        │
        ▼
Latency Exceeded
        │
        ▼
Consume Error Budget
        │
        ▼
Update Dashboard
```

