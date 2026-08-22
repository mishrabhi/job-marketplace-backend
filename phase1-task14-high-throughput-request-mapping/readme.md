# High-Throughput Request Mapping

This module establishes the high-throughput request processing layer for PlaceMux, focusing on multi-core Node.js clustering, optimized database connection pools, non-blocking execution paths, and adaptive event-loop load shedding.

The task is designed to distribute incoming HTTP traffic across available CPU cores while protecting the application from extreme traffic spikes and event-loop saturation.

# Core Architecture

The High-Throughput Request Mapping layer focuses on three primary responsibilities:

- **Multi-Core Clustering** — Uses Node.js worker processes across available CPU cores to distribute incoming HTTP requests.
- **Connection Pool Optimization** — Tunes database connection pools to support high levels of concurrent request processing.
- **Adaptive Load Shedding** — Detects event-loop saturation and returns controlled `503 Service Unavailable` responses instead of allowing the server to become unstable.

```text
Incoming HTTP Traffic
        │
        ▼
   Master Process
        │
   ┌────┼────┬────┐
   ▼    ▼    ▼    ▼
Worker Worker Worker Worker
   │    │    │    │
   └────┼────┼────┘
        │
        ▼
 Database Connection Pool
        │
        ▼
   Application Logic
        │
        ▼
      Response
```

# High-Throughput Principles

## Multi-Core Clustering

The server uses Node.js clustering to create multiple worker processes.

The master process distributes incoming HTTP connections across workers using the Node.js cluster architecture.

```text
Master Process
      │
      ├── Worker 1
      ├── Worker 2
      ├── Worker 3
      └── Worker N
```

This allows the application to utilize multiple CPU cores rather than relying on a single Node.js process.

## Database Connection Pooling

Database connections are managed through tuned connection pools so that concurrent requests can efficiently reuse established database connections.

```text
Workers
   │
   ▼
Connection Pool
   │
   ├── Connection 1
   ├── Connection 2
   ├── Connection 3
   └── Connection N
```

## Non-Blocking Execution

Request processing paths are designed to avoid unnecessary blocking operations that could prevent the Node.js event loop from serving other requests.

```text
Incoming Request
      │
      ▼
Non-Blocking Execution
      │
      ├── Continue Processing
      ├── Await I/O
      └── Serve Other Requests
```

## Adaptive Load Shedding

When event-loop lag exceeds configured thresholds during extreme traffic spikes, the server protects itself by rejecting additional requests with a structured `503 Service Unavailable` response.

```text
Traffic Spike
     │
     ▼
Event Loop Monitoring
     │
     ▼
Threshold Exceeded
     │
     ▼
Load Shedding
     │
     ▼
503 Service Unavailable
     │
     └── Retry-After: 2
```

This prevents uncontrolled resource exhaustion and allows clients to retry after the server recovers.

# Verification Guide

## Step 1 — Start the Clustered Multi-Core Server

Start the clustered server:

```bash
npm run cluster
```

### Expected Result

The master process forks worker processes across the available CPU cores.

Incoming HTTP connections are distributed across the worker processes through the Node.js cluster mechanism.

Expected architecture:

```text
Master
  │
  ├── Worker 1
  ├── Worker 2
  ├── Worker 3
  └── Worker N
```

# Step 2 — Run Autocannon Load Benchmark

Execute the configured Autocannon benchmark:

```bash
npm run bench:autocannon
```

### Expected Result

The server should sustain:

```text
3,500+ requests/sec
```

with:

```text
p99 latency < 50ms
```

The benchmark validates the throughput capability of the clustered request-processing architecture.

```text
Concurrent Connections
        │
        ▼
   Cluster Workers
        │
        ▼
Optimized Request Paths
        │
        ▼
   High Throughput
```

# Step 3 — Verify Adaptive Load Shedding

Run the configured k6 concurrency spike test:

```bash
npm run bench:k6
```

### Expected Result

When event-loop lag breaches the configured thresholds, the server should return:

```text
503 Service Unavailable
```

with:

```http
Retry-After: 2
```

Instead of allowing the server to crash or become unresponsive.

Expected response behavior:

```text
Extreme Traffic Spike
        │
        ▼
Event Loop Lag
        │
        ▼
Threshold Breached
        │
        ▼
Load Shedding
        │
        ▼
503 Service Unavailable
        │
        ▼
Retry-After: 2
```

# Step 4 — Check Real-Time Telemetry

Query the throughput telemetry endpoint:

```bash
curl -X GET \
  "http://localhost:3000/api/v1/throughput/telemetry"
```

### Expected Result

Returns the current throughput and load-management telemetry exposed by the service.

This endpoint provides visibility into the runtime behavior of the high-throughput request processing layer.

# Request Processing Workflow

```text
HTTP Request
     │
     ▼
Cluster Master
     │
     ▼
Worker Selection
     │
     ▼
Worker Process
     │
     ▼
Event Loop
     │
     ├── Healthy
     │      │
     │      ▼
     │   Process Request
     │      │
     │      ▼
     │   Database Pool
     │
     └── Saturated
            │
            ▼
       Load Shedding
            │
            ▼
           503
```

# Load Protection Workflow

```text
Normal Traffic
     │
     ▼
Workers Process Requests
     │
     ▼
Successful Responses
```

```text
Extreme Traffic
     │
     ▼
Event Loop Monitoring
     │
     ▼
Lag Threshold Exceeded
     │
     ▼
Reject Excess Requests
     │
     ▼
503 Service Unavailable
     │
     ▼
Client Retries
```

# Performance Targets

| Metric | Expected Result |
| ------ | --------------- |
| Worker Architecture | Multi-core Node.js cluster |
| Concurrent Load | 100 connections |
| Throughput | 3,500+ requests/sec |
| p99 Latency | < 50ms |
| Extreme Load Behavior | Controlled load shedding |
| Load Shedding Status | `503 Service Unavailable` |
| Retry Header | `Retry-After: 2` |

# API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `GET` | `/api/v1/throughput/telemetry` | Retrieve real-time throughput and load telemetry |

# Benchmark Commands

| Command | Purpose |
| ------- | ------- |
| `npm run cluster` | Start the multi-core clustered server |
| `npm run bench:autocannon` | Run the high-throughput Autocannon benchmark |
| `npm run bench:k6` | Run the extreme concurrency and load-shedding test |

# Overall Architecture

```text
                    Incoming Traffic
                           │
                           ▼
                    Master Process
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           Worker 1     Worker 2     Worker N
              │            │            │
              └────────────┼────────────┘
                           │
                           ▼
                 Non-Blocking Execution
                           │
                           ▼
                 Database Connection Pool
                           │
                           ▼
                    Application Logic
                           │
                           ▼
                       Response
```

Under extreme load:

```text
Incoming Traffic
       │
       ▼
Cluster Workers
       │
       ▼
Event Loop Monitoring
       │
       ├── Within Limits ──► Process Request
       │
       └── Threshold Exceeded
                  │
                  ▼
             Load Shedding
                  │
                  ▼
        503 Service Unavailable
                  │
                  ▼
          Retry-After: 2
```

The combination of multi-core clustering, optimized connection pooling, non-blocking execution, throughput benchmarking, real-time telemetry, and adaptive load shedding provides the foundation for handling high request volumes while maintaining controlled behavior during extreme traffic conditions.