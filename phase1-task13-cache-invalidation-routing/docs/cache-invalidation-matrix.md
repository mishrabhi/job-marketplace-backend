# Cache Invalidation Strategy & Tagging Matrix (Task 13)

## 1. Precise Invalidation vs. Over-Eviction
To avoid over-broad cache flushes (e.g. `FLUSHALL` or blanket wildcard wipes) that destroy cache hit ratios, we apply a **Tag-Set & Precise Key Invalidation** strategy.

## 2. Write-to-Cache Invalidation Mapping

| Write Operation | Entity Affected | Primary Key Evicted | Associated Tag Sets Evicted | Maximum Acceptable Staleness |
| :--- | :--- | :--- | :--- | :--- |
| `POST /applications` | Application | `placemux:app:<appId>` | `tag:job:<jobId>:apps`, `tag:student:<studentId>:apps` | **0ms (Immediate)** |
| `PATCH /applications/:id/status` | Application | `placemux:app:<appId>` | `tag:job:<jobId>:apps`, `tag:student:<studentId>:apps`, `tag:stats:drive:<driveId>` | **0ms (Immediate)**[cite: 18] |
| `DELETE /applications/:id` | Application | `placemux:app:<appId>` | `tag:job:<jobId>:apps`, `tag:student:<studentId>:apps` | **0ms (Immediate)**[cite: 18] |

## 3. Invalidation Mechanics[cite: 18]
1. When a read query is cached, its exact cache key is registered inside a Redis Set: `SADD tag:<entity>:<id> <cacheKey>`[cite: 18].
2. When a write/mutation occurs, the application looks up all member keys inside `tag:<entity>:<id>`, deletes them in a single batch, and purges the tag set[cite: 18].