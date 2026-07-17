# Performance Profiling & Bottleneck Optimization Engine 

This module implements the **Performance Profiling & Bottleneck Optimization Engine** for the PlaceMux backend. It provides tooling to profile slow database operations, detect inefficient query patterns, and measure optimization improvements using **P95 latency benchmarks**.

The platform enables engineering teams to identify performance bottlenecks, validate optimization efforts, and maintain high-performance APIs through measurable latency improvements.


# Folder Structure

```text
phase3-task3-performance-profiling/
├── migrations/
│   └── 035_performance_profiling_tables.sql   # Performance profiling & benchmark schema
├── src/
│   ├── config/
│   │   ├── db.js                              # Database connection
│   │   ├── env.js                             # Environment configuration
│   │   └── logger.js                          # Structured logging
│   ├── middlewares/
│   │   └── errorHandler.js                    # Global error handler
│   ├── validators/
│   │   └── performance.validator.js           # Request validation schemas
│   ├── controllers/
│   │   └── performance.controller.js          # Performance endpoints
│   ├── services/
│   │   └── performance.service.js             # Profiling & optimization engine
│   └── routes/
│       ├── performance.routes.js              # /api/v1/performance endpoints
│       └── index.js                           # Route registry
├── app.js                                     # Express application
├── server.js                                  # Server bootstrap
├── package.json                               # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Query Performance Profiling

The profiling engine records slow database operations for engineering analysis.

Each profiling record captures:

* Endpoint Path
* SQL Query
* Execution Time
* N+1 Query Detection
* Tenant ID
* Timestamp

This creates a historical repository of performance bottlenecks.


## 2. Bottleneck Detection

The profiling service identifies inefficient database access patterns, including:

* Slow queries
* N+1 query problems
* High-latency endpoints
* Expensive joins
* Repeated database scans

These insights help prioritize optimization efforts.


## 3. Optimization Benchmarking

Once improvements have been implemented, the benchmarking engine records measurable performance gains.

Each benchmark includes:

* Endpoint
* P95 Latency (Before)
* P95 Latency (After)
* Optimization Applied
* Improvement Metrics

This provides verifiable evidence of performance improvements.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration inside your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/035_performance_profiling_tables.sql
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


## Step 1 — Log a Performance Profile

```bash
curl -X POST "$BASE/performance/profiles/log" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_path": "/api/v1/colleges/portal-report",
    "query_raw_string": "SELECT * FROM students WHERE college_id = c_id",
    "execution_time_ms": 340.50,
    "is_n_plus_one": true,
    "tenant_id": "a1b23c44-dd55-66ee-77ff-88aa99bb0011"
  }'
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "profile_logged": true
}
```

Verify that the profiling record has been persisted to the historical performance repository for engineering analysis.


## Step 2 — Record an Optimization Benchmark

```bash
curl -X POST "$BASE/performance/benchmarks/commit" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint_path": "/api/v1/colleges/portal-report",
    "p95_latency_before": 340.50,
    "p95_latency_after": 12.20,
    "optimization_applied": "Eliminated N+1 nested loop query paradigm by generating an aggregated single JOIN relational view block alongside strict multi-tenant filtering criteria constraints"
  }'
```

### Expected Result

Returns **HTTP 200 OK**.

Example response:

```json
{
  "success": true,
  "benchmark_recorded": true,
  "latency_improvement_ms": 328.30
}
```

The benchmark demonstrates a measurable **P95 latency improvement** from **340.50 ms** to **12.20 ms**, confirming that the optimization successfully eliminated the bottleneck.


# Performance Features

* Query performance profiling
* Slow query logging
* N+1 query detection
* Endpoint latency tracking
* P95 benchmark recording
* Before/after optimization metrics
* Persistent performance history
* Structured engineering telemetry
* Production-ready optimization platform


# Query Profiling Workflow

```text
Incoming Request
        │
        ▼
Execute Database Query
        │
        ▼
Measure Execution Time
        │
        ▼
Detect N+1 Pattern
        │
        ▼
Persist Profile
        │
        ▼
Return Response
```


# Optimization Benchmark Workflow

```text
Performance Analysis
        │
        ▼
Identify Bottleneck
        │
        ▼
Apply Optimization
        │
        ▼
Measure P95 Latency
        │
        ▼
Compare Before & After
        │
        ▼
Persist Benchmark
```
