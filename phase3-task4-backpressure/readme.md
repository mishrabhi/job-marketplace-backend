# Horizontal Scale Concurrency & Adaptive Backpressure Architecture

This module implements the **Horizontal Scale Concurrency & Adaptive Backpressure Architecture** for the PlaceMux backend. It provides mechanisms to measure system scalability under heavy concurrent workloads while protecting services through adaptive backpressure strategies, request timeouts, and circuit breakers.

The objective is to maintain platform stability during traffic spikes by preventing cascading failures and ensuring graceful degradation under high load.


#  Folder Structure

```text
phase3-task4-horizontal-scale/
├── migrations/
│   └── 036_scalability_tables.sql          # Load testing & scalability schema
├── src/
│   ├── config/
│   │   ├── db.js                           # Database connection
│   │   ├── env.js                          # Environment configuration
│   │   └── logger.js                       # Structured logging
│   ├── middlewares/
│   │   ├── errorHandler.js                 # Global error handler
│   │   ├── timeout.js                      # Request timeout middleware
│   │   └── circuitBreaker.js               # Circuit breaker implementation
│   ├── validators/
│   │   └── scalability.validator.js        # Request validation schemas
│   ├── controllers/
│   │   └── scalability.controller.js       # Scalability endpoints
│   ├── services/
│   │   └── scalability.service.js          # Load testing & backpressure engine
│   └── routes/
│       ├── scalability.routes.js           # /api/v1/scalability endpoints
│       └── index.js                        # Route registry
├── app.js                                  # Express application
├── server.js                               # Server bootstrap
├── package.json                            # Project manifest
└── README.md
```


# Core Architecture & Workflow

## 1. Horizontal Scalability Testing

The scalability engine records performance metrics collected during high-concurrency load tests.

Each test execution captures:

* Test Run Identifier
* Concurrent Requests
* Throughput (Requests/Second)
* Average Latency
* Peak Latency
* Error Rate
* Test Timestamp

This allows engineering teams to evaluate system performance as traffic increases.


## 2. Adaptive Backpressure

To prevent service degradation during traffic spikes, the platform applies adaptive backpressure mechanisms.

The protection layer includes:

* Request queue management
* Request throttling
* Explicit outbound timeouts
* Controlled request rejection
* Graceful degradation

These controls ensure the system remains responsive instead of becoming overloaded.


## 3. Circuit Breaker Protection

The circuit breaker monitors downstream service failures.

It automatically:

* Detects repeated failures
* Opens the circuit after a configurable threshold
* Rejects additional requests while downstream services recover
* Closes the circuit after successful recovery

This prevents cascading failures across dependent services.


# Setup & Execution Guide

## 1. Deploy Database Schema

Run the migration inside your PostgreSQL/Supabase instance.

```bash
psql \
  -h your-supabase-host \
  -U postgres \
  -d postgres \
  -f migrations/036_scalability_tables.sql
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
export RUN_TOKEN="load-test-marketplace-2026-v1"
```


## Step 1 — Record a Load Test Execution

```bash
curl -X POST "$BASE/scalability/load-test" \
  -H "Content-Type: application/json" \
  -d "{
    \"run_token\": \"$RUN_TOKEN\",
    \"concurrent_users\": 1000,
    \"requests_per_second\": 1450,
    \"average_latency_ms\": 82,
    \"peak_latency_ms\": 210,
    \"error_rate_percent\": 0.8
  }"
```

### Expected Result

Returns **HTTP 201 Created**.

Example response:

```json
{
  "success": true,
  "test_recorded": true
}
```

The load test metrics are stored for historical analysis and capacity planning.


## Step 2 — Verify Adaptive Backpressure

Simulate a burst of concurrent traffic using a load-testing tool (such as `wrk`, `k6`, or `ab`) or by repeatedly invoking the endpoint.

Example:

```bash
for i in {1..500}; do
  curl -s "$BASE/scalability/load-test" &
done
wait
```

### Expected Result

During high-load conditions:

* Healthy requests continue to be served.
* Excess requests are throttled or rejected gracefully.
* The service remains responsive without crashing.
* Timeout policies prevent long-running requests from exhausting resources.


## Step 3 — Verify Circuit Breaker Behavior

Force repeated downstream failures to trigger the circuit breaker.

Expected behavior:

* Initial failures are retried.
* Once the configured failure threshold is reached, the circuit transitions to the **OPEN** state.
* Additional requests fail fast until recovery conditions are met.
* The circuit automatically transitions back to **HALF-OPEN** and eventually **CLOSED** after successful health checks.


# Scalability Features

* Horizontal scalability testing
* Concurrent load profiling
* Adaptive backpressure
* Request throttling
* Explicit request timeouts
* Circuit breaker protection
* Graceful degradation
* Persistent load-test history
* Production-ready scalability architecture


# Load Testing Workflow

```text
Load Test Request
        │
        ▼
Generate Concurrent Traffic
        │
        ▼
Collect Performance Metrics
        │
        ▼
Persist Benchmark
        │
        ▼
Generate Scalability Report
```


# Backpressure Workflow

```text
Incoming Requests
        │
        ▼
Traffic Spike Detected
        │
        ▼
Apply Backpressure
        │
        ├────────────► Queue Requests
        │
        ├────────────► Throttle Requests
        │
        ├────────────► Apply Timeouts
        │
        └────────────► Trigger Circuit Breaker
                    │
                    ▼
             Maintain Stability
```
