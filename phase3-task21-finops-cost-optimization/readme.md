# Cost Optimization & FinOps Engine 

This module implements the **Cost Optimization & FinOps Engine** for the PlaceMux backend. It provides workload-level infrastructure cost attribution, payload and database query optimization tracking, and unit economics reporting to measure operational efficiency across the platform.

The engine helps engineering teams understand infrastructure spending, compare optimized versus unoptimized workloads, and validate cost reductions while maintaining service-level objectives (SLOs).


# Folder Structure

```text
phase3-task21-finops/
├── migrations/
│   └── 053_finops_cost_optimization.sql                  # FinOps & workload cost schema
├── src/
│   ├── config/
│   │   ├── db.js                             # Database connection
│   │   ├── env.js                            # Environment configuration
│   │   └── logger.js                         # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                   # Global error handler
│   ├── validators/
│   │   └── finops.validator.js               # Request validation schemas
│   ├── controllers/
│   │   └── finops.controller.js              # FinOps endpoints
│   ├── services/
│   │   └── finops.service.js                 # Cost optimization engine
│   └── routes/
│       ├── finops.routes.js                  # /api/v1/finops endpoints
│       └── index.js                          # Route registry
├── app.js                                    # Express application
├── server.js                                 # Server bootstrap
├── package.json                              # Project manifest
└── README.md
```

# Core Architecture & Workflow

## 1. Workload Cost Attribution

Every business operation executed by the platform records estimated infrastructure consumption.

Tracked metrics include:

- Payload Size
- Database Query Time
- Operation Type
- Optimization Status
- Estimated Infrastructure Cost
- Tenant Context

These records provide visibility into platform resource utilization.

## 2. Optimization Tracking

The engine compares optimized and unoptimized execution paths to quantify performance improvements.

Optimization metrics include:

- Payload Compression
- Database Query Optimization
- Reduced Processing Time
- Lower Infrastructure Cost
- Improved Resource Efficiency

## 3. Unit Economics Reporting

The FinOps engine calculates infrastructure cost per operational batch.

Reports include:

- Cost per 1,000 Transactions
- Average Query Cost
- Payload Efficiency
- Cost Savings
- SLO Compliance

This enables continuous monitoring of platform economics.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration within your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/052_finops_tables.sql
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

export TENANT_UUID="a1b23c44-dd55-66ee-77ff-88aa99bb0011"
```

## Step 1 — Record Baseline (Unoptimized) Workload Cost

```bash
curl -X POST "$BASE/finops/costs/record" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"operation_type\": \"CANDIDATE_APPLICATION\",
    \"payload_bytes\": 50000,
    \"db_query_time_ms\": 120,
    \"is_optimized\": false,
    \"idempotency_key\": \"finops-baseline-cost-001\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "estimated_cost_inr": 12.84,
  "optimization_applied": false
}
```

The baseline workload cost is recorded using the unoptimized execution profile.


## Step 2 — Record Optimized Workload Cost

```bash
curl -X POST "$BASE/finops/costs/record" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"operation_type\": \"CANDIDATE_APPLICATION\",
    \"payload_bytes\": 50000,
    \"db_query_time_ms\": 120,
    \"is_optimized\": true,
    \"idempotency_key\": \"finops-optimized-cost-002\"
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "estimated_cost_inr": 5.91,
  "optimization_applied": true,
  "payload_reduction_percent": 60,
  "query_time_reduction_percent": 50
}
```

The optimized workload demonstrates significant reductions in payload size, query execution time, and overall infrastructure cost.

---

## Step 3 — Compute Unit Economics

```bash
curl -X POST "$BASE/finops/unit-economics/compute" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenant_id\": \"$TENANT_UUID\",
    \"batch_identifier\": \"optimized_v2_run\"
  }"
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "cost_per_1k_inr": 48.25,
  "cost_reduction_percent": 52,
  "slo_compliant": true
}
```

The generated report compares optimized and baseline workloads, confirming reduced infrastructure cost per 1,000 transactions while maintaining platform SLOs.


# FinOps Features

- Workload Cost Attribution
- Payload Size Tracking
- Database Query Cost Analysis
- Infrastructure Cost Estimation
- Optimization Comparison
- Unit Economics Reporting
- Tenant-Level Cost Visibility
- Structured FinOps Audit Logging
- Production-ready Cost Optimization Platform


# Cost Attribution Workflow

```text
Business Operation
        │
        ▼
Capture Workload Metrics
        │
        ▼
Estimate Infrastructure Cost
        │
        ▼
Persist Cost Record
        │
        ▼
Generate Cost Analytics
```

#  Optimization Workflow

```text
Incoming Workload
        │
        ▼
Determine Optimization Mode
        │
        ├────────────► Unoptimized
        │
        └────────────► Optimized
                        │
                        ▼
Compare Resource Consumption
                        │
                        ▼
Calculate Cost Savings
```


# Unit Economics Workflow

```text
Historical Cost Records
          │
          ▼
Aggregate Batch Metrics
          │
          ▼
Compute Cost per 1K Transactions
          │
          ▼
Evaluate Cost Savings
          │
          ▼
Verify SLO Compliance
```
