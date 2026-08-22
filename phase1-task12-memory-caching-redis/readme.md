# Memory Caching with Redis

This module establishes the distributed caching layer for PlaceMux using Redis and the Cache-Aside pattern. It focuses on reducing database load, improving response latency, preventing cache stampedes through distributed mutex locking, managing cache expiration through TTL policies, and exposing cache hit-ratio metrics.

# Core Architecture

The Memory Caching layer focuses on four primary responsibilities:

- **Cache-Aside Pattern** — Checks Redis before querying the database and stores database results in Redis when a cache miss occurs.
- **Distributed Mutex** — Prevents multiple concurrent requests from simultaneously rebuilding the same missing cache entry.
- **TTL Management** — Controls how long cached resources remain valid.
- **Cache Metrics** — Tracks cache hits, misses, stampede prevention, and related performance metrics.

```text
Client Request
      │
      ▼
Check Redis Cache
      │
   ┌──┴─────┐
   │        │
 HIT       MISS
   │        │
   ▼        ▼
Return    Acquire
Cache     Mutex
            │
            ▼
        Check Cache
        Again
            │
       ┌────┴────┐
       │         │
     HIT        MISS
       │         │
       ▼         ▼
  Return      Database
  Cache       Query
                  │
                  ▼
             Store in Redis
                  │
                  ▼
             Release Mutex
                  │
                  ▼
               Response
```

# Cache-Aside Principles

## Cache-Aside Pattern

The application first checks Redis for the requested resource.

If the requested data is already available:

```text
Redis
  │
  ▼
Cache HIT
  │
  ▼
Return Cached Data
```

If the data is not available:

```text
Redis
  │
  ▼
Cache MISS
  │
  ▼
Database
  │
  ▼
Store Result in Redis
  │
  ▼
Return Response
```

This reduces repeated database queries for frequently accessed resources.

## Distributed Mutex

When many requests arrive simultaneously after a cache entry expires or is invalidated, all requests could otherwise query the database at the same time.

This is commonly known as a cache stampede or thundering herd.

The distributed mutex ensures that only one request performs the database fetch while other requests wait for the cache to be populated.

```text
10 Concurrent Requests
          │
          ▼
      Cache MISS
          │
          ▼
     Mutex Lock
          │
          ├── Request 1 ──► Database
          │                    │
          │                    ▼
          │               Redis Cache
          │
          └── Requests 2-10
                    │
                    ▼
                Wait for Lock
                    │
                    ▼
              Redis Cache HIT
```

The verification scenario expects exactly one database query while the remaining requests resolve from Redis after the lock is released.

## TTL Management

Cached values use TTL policies to ensure that cached data does not remain indefinitely.

```text
Database Data
     │
     ▼
Redis Cache
     │
     ▼
TTL Countdown
     │
     ├── TTL Active ──► Cache HIT
     │
     └── TTL Expired ─► Cache MISS
                            │
                            ▼
                       Database Fetch
```

# Verification Guide

## Step 1 — Call 1: Verify Cache MISS

Request the hot drives endpoint:

```bash
curl -X GET "http://localhost:3000/api/v1/cache-demo/drives/hot"
```

### Expected Result

Returns **HTTP 200 OK**.

Because the resource is not yet cached, the request should fall back to the database.

Expected response metrics:

```json
{
  "source": "DATABASE_FETCH",
  "response_time": "~350ms"
}
```

Expected flow:

```text
Request
  │
  ▼
Redis
  │
  ▼
MISS
  │
  ▼
Database
  │
  ▼
Store in Redis
  │
  ▼
Response
```

# Step 2 — Call 2: Verify Cache HIT

Execute the same request again:

```bash
curl -X GET "http://localhost:3000/api/v1/cache-demo/drives/hot"
```

### Expected Result

Returns **HTTP 200 OK**.

The resource should now be available in Redis.

Expected response metrics:

```json
{
  "source": "REDIS_CACHE_HIT",
  "response_time": "~1.5ms"
}
```

The verification scenario expects approximately **99.5% lower response latency** compared with the database-backed request.

```text
First Request
     │
     ▼
DATABASE_FETCH
     │
     ▼
~350ms

Second Request
     │
     ▼
REDIS_CACHE_HIT
     │
     ▼
~1.5ms
```

# Step 3 — Simulate Concurrent Cache Stampede

First invalidate the cached drive by updating its status:

```bash
curl -X PATCH \
  "http://localhost:3000/api/v1/cache-demo/drives/drive_001/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

Then fire 10 requests concurrently:

```bash
for i in {1..10}; do
  curl -s "http://localhost:3000/api/v1/cache-demo/drives/hot" &
done
wait
```

### Expected Result

All 10 requests initially encounter the missing cache entry.

The distributed mutex ensures that only **one** request queries the database.

The remaining nine requests wait for the mutex and resolve after the cache has been populated.

Expected server behavior:

```text
10 Concurrent Requests
          │
          ▼
      Cache MISS
          │
          ▼
     Distributed Mutex
          │
          ├── 1 Request ──► Database
          │                     │
          │                     ▼
          │                Redis Cache
          │
          └── 9 Requests ──► Wait
                                │
                                ▼
                         Redis Cache HIT
```

### Verification Metrics

Server logs should demonstrate:

```text
Database Queries: 1
Stampedes Prevented: 9
```

The nine waiting requests should resolve through:

```text
REDIS_CACHE_POST_LOCK_HIT
```

This demonstrates protection against the thundering herd problem.

# Step 4 — Inspect Live Cache Hit-Ratio Metrics

Query the cache metrics endpoint:

```bash
curl -X GET "http://localhost:3000/api/v1/cache-demo/metrics"
```

### Expected Result

Returns live cache performance metrics, including cache hits, misses, and stampede-prevention information.

These metrics provide visibility into how effectively Redis is reducing database traffic.

# Cache Stampede Prevention Workflow

```text
Cache Entry Invalidated
        │
        ▼
Multiple Requests Arrive
        │
        ▼
Multiple Cache MISS
        │
        ▼
Acquire Distributed Mutex
        │
        ├── First Request
        │      │
        │      ▼
        │   Database
        │      │
        │      ▼
        │   Redis Cache
        │
        └── Remaining Requests
               │
               ▼
            Wait
               │
               ▼
        Re-check Redis
               │
               ▼
           Cache HIT
```

# Cache Lifecycle

```text
Database
   │
   ▼
Cache MISS
   │
   ▼
Fetch Data
   │
   ▼
Redis SET
   │
   ▼
TTL Active
   │
   ├── Request ──► Cache HIT
   │
   └── TTL Expired
            │
            ▼
        Cache MISS
            │
            ▼
       Refresh Cache
```

# Performance Comparison

| Scenario | Source | Expected Response Time |
| -------- | ------ | ----------------------- |
| Initial request | `DATABASE_FETCH` | ~350ms |
| Cached request | `REDIS_CACHE_HIT` | ~1.5ms |
| Concurrent request after invalidation | `REDIS_CACHE_POST_LOCK_HIT` | Served after mutex release |

# Cache Metrics

| Metric | Purpose |
| ------ | ------- |
| Cache Hit | Measures requests served directly from Redis |
| Cache Miss | Measures requests requiring database access |
| Stampedes Prevented | Measures concurrent requests protected by the distributed mutex |
| Response Time | Measures cache and database request latency |

# API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `GET` | `/api/v1/cache-demo/drives/hot` | Retrieve frequently accessed drive data using Redis caching |
| `PATCH` | `/api/v1/cache-demo/drives/:id/status` | Update drive status and invalidate related cache |
| `GET` | `/api/v1/cache-demo/metrics` | Retrieve cache performance and hit-ratio metrics |

# Overall Request Flow

```text
Client
  │
  ▼
GET /cache-demo/drives/hot
  │
  ▼
Redis Lookup
  │
  ├──────────────► HIT
  │                  │
  │                  ▼
  │              Fast Response
  │
  └──────────────► MISS
                     │
                     ▼
              Acquire Mutex
                     │
                     ▼
              Query Database
                     │
                     ▼
               Store in Redis
                     │
                     ▼
              Release Mutex
                     │
                     ▼
                  Response
```

The combination of Redis Cache-Aside, distributed mutex protection, TTL-based expiration, explicit invalidation, and cache metrics provides a scalable caching foundation for frequently accessed PlaceMux resources while protecting the database from unnecessary repeated queries and cache stampedes.