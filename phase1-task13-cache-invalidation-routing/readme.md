# Cache Invalidation Routing

This module establishes a tag-based Redis cache invalidation layer for PlaceMux. It connects cache entries to resource-specific tags, triggers invalidation automatically from write operations, and maintains bounded staleness by ensuring affected cached resources are evicted whenever their underlying data changes.

# Core Architecture

The Cache Invalidation layer focuses on three primary responsibilities:

- **Tag-Based Invalidation** — Associates cached resources with logical Redis tags for targeted eviction.
- **Write-Path Hooks** — Automatically invalidates affected cache entries after successful data mutations.
- **Bounded Staleness** — Ensures subsequent reads retrieve fresh data after a related resource has been updated.

```text
Read Request
     │
     ▼
Redis Cache
     │
 ┌───┴────┐
 │        │
HIT      MISS
 │        │
 ▼        ▼
Return   Database
Cache    Fetch
           │
           ▼
      Store with Tags
```

```text
Write Request
     │
     ▼
Database Mutation
     │
     ▼
Invalidation Hook
     │
     ▼
Evict Matching Tags
     │
     ▼
Next Read
     │
     ▼
Fresh Database Data
```

# Cache Invalidation Principles

## Tag-Based Cache Entries

Cached resources are associated with logical tags representing the resources they depend on.

For example, the job applications cache can use:

```text
tag:job:job_01:apps
```

An individual application can use:

```text
tag:app:app_101
```

This allows the application to invalidate only the cache entries affected by a particular mutation.

## Targeted Invalidation

When an application status changes, only the relevant job and application caches are evicted.

For example:

```text
Application Status Update
          │
          ▼
       app_101
          │
          ├── tag:app:app_101
          │
          └── tag:job:job_01:apps
```

Unrelated job caches remain intact.

## Write-Path Hooks

Cache invalidation is connected directly to successful write operations.

```text
PATCH Application Status
          │
          ▼
    Update Database
          │
          ▼
   Invalidation Hook
          │
          ▼
     Evict Tags
```

This ensures that cache invalidation occurs as part of the data mutation workflow rather than relying on manual cache clearing.

## Bounded Staleness

After a resource is modified and its associated cache entries are evicted, the next read retrieves the latest state from the database and repopulates the cache.

```text
Cached Data
    │
    ▼
Database Update
    │
    ▼
Cache Eviction
    │
    ▼
Next Read
    │
    ▼
Database Fetch
    │
    ▼
Fresh Cache Entry
```

# Verification Guide

## Step 1 — Prime the Cache

Fetch applications associated with `job_01`.

### Call 1 — Database Fetch

```bash
curl -X GET \
  "http://localhost:3000/api/v1/jobs/job_01/applications"
```

### Call 2 — Cache Hit

Execute the same request again:

```bash
curl -X GET \
  "http://localhost:3000/api/v1/jobs/job_01/applications"
```

### Expected Result

The first request retrieves the data from the database and stores the result in Redis with the relevant cache tags.

Expected first response:

```json
{
  "source": "DATABASE_FETCH"
}
```

The second request should retrieve the same data directly from Redis.

Expected second response:

```json
{
  "source": "REDIS_CACHE_HIT"
}
```

Expected cache flow:

```text
Call 1
  │
  ▼
Database Fetch
  │
  ▼
Redis Cache + Tags
  │
  ▼
Response

Call 2
  │
  ▼
Redis Cache HIT
  │
  ▼
Response
```

# Step 2 — Execute Write Operation

Update the application status to `OFFERED`.

```bash
curl -X PATCH \
  "http://localhost:3000/api/v1/applications/app_101/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "OFFERED"
  }'
```

### Expected Result

Returns:

```text
200 OK
```

The successful write operation triggers the cache invalidation hook.

Expected server log behavior:

```text
[Invalidation Hook] Evicted tag:job:job_01:apps
[Invalidation Hook] Evicted tag:app:app_101
```

Unrelated job caches should remain unaffected.

Expected flow:

```text
PATCH Application
      │
      ▼
Update Status → OFFERED
      │
      ▼
Invalidation Hook
      │
      ├── Evict tag:job:job_01:apps
      │
      └── Evict tag:app:app_101
```

# Step 3 — Verify Fresh Data on Next Read

Fetch the job applications again:

```bash
curl -X GET \
  "http://localhost:3000/api/v1/jobs/job_01/applications"
```

### Expected Result

Because the previous write operation invalidated the affected cache entries, the next request should retrieve fresh data from the database.

Expected source:

```json
{
  "source": "DATABASE_FETCH"
}
```

The updated application status should now be reflected in the response:

```text
app_101
   │
   ▼
status: OFFERED
```

The fresh database result can then be stored back in Redis with the appropriate tags.

# Cache Invalidation Workflow

```text
Client
  │
  ▼
Read Applications
  │
  ▼
Redis
  │
  ├── HIT ──────────────► Return Cached Data
  │
  └── MISS
       │
       ▼
   Database
       │
       ▼
 Store with Tags
```

```text
Client
  │
  ▼
Update Application
  │
  ▼
Database Mutation
  │
  ▼
Invalidation Hook
  │
  ▼
Targeted Tag Eviction
  │
  ▼
Next Read
  │
  ▼
Fresh Database Data
  │
  ▼
Repopulate Redis
```

# Tag Mapping

| Resource | Cache Tag |
| -------- | --------- |
| Job applications | `tag:job:job_01:apps` |
| Individual application | `tag:app:app_101` |

# Verification Scenarios

| Scenario | Expected Result |
| -------- | --------------- |
| First applications request | `DATABASE_FETCH` |
| Repeated applications request | `REDIS_CACHE_HIT` |
| Application status update | `200 OK` |
| Related job cache | Evicted |
| Individual application cache | Evicted |
| Unrelated job caches | Remain intact |
| Read after mutation | Fresh database data |
| Cache after fresh read | Repopulated with updated data |

# API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `GET` | `/api/v1/jobs/:job_id/applications` | Retrieve job applications using tagged Redis caching |
| `PATCH` | `/api/v1/applications/:application_id/status` | Update application status and trigger targeted cache invalidation |

# Data Consistency Workflow

```text
Cached State
     │
     ▼
Write Operation
     │
     ▼
Database Updated
     │
     ▼
Relevant Cache Tags Evicted
     │
     ▼
Stale Cache Removed
     │
     ▼
Next Read
     │
     ▼
Fresh Database State
     │
     ▼
Redis Repopulated
```

The combination of tag-based invalidation and write-path hooks provides targeted cache eviction while avoiding unnecessary invalidation of unrelated resources. This keeps cached data aligned with database state and provides bounded staleness for PlaceMux APIs.