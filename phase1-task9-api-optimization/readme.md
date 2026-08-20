# API Optimization & Caching Engine

This module establishes the API performance optimization layer for PlaceMux, focusing on database query tuning, covering indexes, `EXPLAIN ANALYZE` profiling, in-memory response caching, explicit cache invalidation, and response-time telemetry.

The task ensures frequently accessed API resources can be served efficiently while maintaining cache consistency after underlying data mutations.

# Core Architecture

The API Optimization layer focuses on four primary responsibilities:

- **Query Optimization** — Uses covering indexes to improve database query performance.
- **Query Profiling** — Uses database `EXPLAIN ANALYZE` execution plans to verify index usage and query efficiency.
- **Response Caching** — Uses in-memory caching to avoid repeated database queries for frequently requested resources.
- **Cache Invalidation** — Explicitly invalidates cached data when the underlying resource changes.

```text
Client Request
      │
      ▼
API Endpoint
      │
      ▼
Cache Lookup
      │
   ┌──┴─────┐
   │        │
 HIT       MISS
   │        │
   ▼        ▼
Return    Database
Cache     Query
             │
             ▼
        Store in Cache
             │
             ▼
        Return Response
```

# Performance Optimization Principles

## Covering Indexes

Database indexes are used to optimize leaderboard queries.

The verification flow checks for usage of:

```text
idx_students_grad_gpa_status
```

The index is intended to reduce unnecessary database scanning when filtering and ordering candidate leaderboard records.

## EXPLAIN ANALYZE Profiling

The database query execution plan can be inspected through the API to verify whether the expected index is being used.

```text
API Request
    │
    ▼
EXPLAIN ANALYZE
    │
    ▼
Execution Plan
    │
    ├── Index Scan
    ├── Execution Time
    └── Query Statistics
```

## In-Memory Caching

Frequently accessed leaderboard data is cached in memory.

The first request retrieves the data from the database:

```text
Cache MISS
   │
   ▼
Database Query
   │
   ▼
Cache Store
```

Subsequent requests can retrieve the same data directly from the cache:

```text
Cache HIT
   │
   ▼
Cached Response
```

## Response Time Telemetry

API responses expose performance information through response headers.

The verification flow checks:

```text
X-Cache-Status
X-Response-Time
```

These headers provide visibility into cache behavior and response latency.

# Verification Guide

## Step 1 — Verify DB EXPLAIN Execution Plan

Inspect the database query execution plan for the candidate leaderboard endpoint.

```bash
curl -X GET \
  "http://localhost:3000/api/v1/candidates/leaderboard/explain?grad_year=2026&limit=10"
```

### Expected Result

Returns **HTTP 200 OK**.

The response should contain an execution plan showing an `Index Scan` using:

```text
idx_students_grad_gpa_status
```

The execution plan should also provide query execution timing information.

Example conceptual execution flow:

```text
Leaderboard Query
       │
       ▼
EXPLAIN ANALYZE
       │
       ▼
Index Scan
       │
       ▼
idx_students_grad_gpa_status
       │
       ▼
Optimized Query Execution
```

# Step 2 — Test Cache MISS vs Cache HIT

The same leaderboard request is executed twice to verify the caching layer.

## Call 1 — Cache MISS

```bash
curl -i -X GET \
  "http://localhost:3000/api/v1/candidates/leaderboard?grad_year=2026&limit=10"
```

### Expected Result

The response should contain:

```text
X-Cache-Status: MISS
```

The response-time telemetry should indicate the database-backed request latency, approximately:

```text
X-Response-Time: ~25ms
```

The request flow is:

```text
Request
  │
  ▼
Cache MISS
  │
  ▼
Database Query
  │
  ▼
Store Result in Cache
  │
  ▼
Response
```

## Call 2 — Cache HIT

Execute the same request again:

```bash
curl -i -X GET \
  "http://localhost:3000/api/v1/candidates/leaderboard?grad_year=2026&limit=10"
```

### Expected Result

The response should contain:

```text
X-Cache-Status: HIT
```

The response-time telemetry should indicate significantly lower latency, approximately:

```text
X-Response-Time: ~1-2ms
```

The request flow is:

```text
Request
  │
  ▼
Cache HIT
  │
  ▼
Cached Response
  │
  ▼
Fast Response
```

# Step 3 — Verify Cache Invalidation on Data Mutation

Update a student's GPA to trigger cache invalidation.

Replace `<INSERT_STUDENT_UUID>` with the target student's UUID.

```bash
curl -X PATCH \
  "http://localhost:3000/api/v1/candidates/<INSERT_STUDENT_UUID>/gpa" \
  -H "Content-Type: application/json" \
  -d '{
    "gpa": 9.95
  }'
```

### Expected Result

The student's GPA is updated and the relevant leaderboard cache is invalidated.

The next leaderboard request should therefore perform a fresh database lookup rather than returning the stale cached result.

```text
GPA Update
    │
    ▼
Database Mutation
    │
    ▼
Cache Invalidation
    │
    ▼
Next Leaderboard Request
    │
    ▼
Cache MISS
    │
    ▼
Fresh Database Query
```

# Cache Consistency Workflow

```text
Read Request
     │
     ▼
Check Cache
     │
 ┌───┴────┐
 │        │
HIT      MISS
 │        │
 ▼        ▼
Return   Query DB
Cache      │
           ▼
       Update Cache
           │
           ▼
        Response
```

```text
Data Mutation
     │
     ▼
Update Database
     │
     ▼
Invalidate Cache
     │
     ▼
Future Reads Use Fresh Data
```

# Performance Verification

| Scenario | Expected Cache Status | Expected Response Time |
| -------- | --------------------- | ---------------------- |
| First leaderboard request | `MISS` | ~25ms |
| Repeated leaderboard request | `HIT` | ~1-2ms |
| Request after GPA update | `MISS` | Fresh database latency |

# API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `GET` | `/api/v1/candidates/leaderboard/explain` | Inspect database execution plan |
| `GET` | `/api/v1/candidates/leaderboard` | Retrieve optimized candidate leaderboard |
| `PATCH` | `/api/v1/candidates/:id/gpa` | Update candidate GPA and invalidate related cache |

# Performance Flow

```text
Client
  │
  ▼
Leaderboard API
  │
  ▼
In-Memory Cache
  │
  ├──────────────► HIT ──────► Fast Response
  │
  └──────────────► MISS
                     │
                     ▼
               Optimized DB Query
                     │
                     ▼
              Covering Index
                     │
                     ▼
                Cache Result
                     │
                     ▼
                  Response
```

The combination of query optimization, index-backed execution, in-memory caching, cache invalidation, and response-time telemetry provides a consistent foundation for improving PlaceMux API performance while preventing stale leaderboard results after data changes.