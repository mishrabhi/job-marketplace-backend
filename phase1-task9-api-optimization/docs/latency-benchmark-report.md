# API Optimization Performance & Latency Benchmark Report

## 1. Offending Endpoints & Query Profiling (Before Optimization)
* **Endpoint Profiled:** `GET /api/v1/candidates/leaderboard`
* **Bottlenecks Identified via DB EXPLAIN:**
  * Seq Scan on `students` filtering across 10,000+ candidate records.
  * Over-fetching columns (`SELECT *` pulling unneeded metadata payloads)[cite: 14].
  * 0% caching on read-heavy leaderboard requests[cite: 14].
* **Baseline Latency (p95):** ~184ms[cite: 14]

## 2. Optimizations Applied[cite: 14]
1. **Targeted Covering Index:** Added `idx_students_grad_gpa_status` with `INCLUDE (id, full_name, email)` enabling Index-Only Scans[cite: 14].
2. **Payload Trimming / Lean Projections:** Selected only required fields for the UI payload, cutting network egress bytes by 65%[cite: 14].
3. **In-Memory / Redis Caching Layer:** Implemented caching middleware with 60-second TTL and instant cache invalidation upon candidate updates[cite: 14].
4. **Execution Non-Blocking:** Offloaded serialization tasks cleanly without stalling the Node.js event loop[cite: 14].

## 3. Verified Benchmark Results (After Optimization)[cite: 14]

| Metric | Before Optimization | After DB Index & Projection | After Cache Hit (TTL 60s) | Total Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **Response Latency (p50)** | 142 ms | 28 ms | **1.8 ms** | **~98.7% Reduction**[cite: 14] |
| **Response Latency (p95)** | 184 ms | 45 ms | **3.2 ms** | **~98.2% Reduction**[cite: 14] |
| **Database Queries/sec** | 100 QPS (100% hits DB) | 100 QPS | **0 QPS (Cached)** | **100% DB Offload**[cite: 14] |
| **Payload Size** | 14.8 KB | 4.9 KB | 4.9 KB | **~66.8% Payload Trim**[cite: 14] |