# High-Throughput Request Mapping & Resilience Benchmark Report

## 1. Bottlenecks Identified in Naive Setup
* **Event Loop Lag:** Heavy synchronous serialization and uncontrolled JSON parsing stalled the event loop under >100 concurrent clients.
* **Connection Pool Exhaustion:** DB connection pool limits starved workers, leading to unhandled socket dropouts and hard server crashes.
* **No Load Shedding:** Unbounded in-flight requests accumulated in memory until the Node.js process ran out of heap space.

## 2. Architectural Mitigations Implemented
1. **Adaptive Event-Loop Load Shedding:** Evaluates Node.js event-loop lag (threshold: 70ms) and inflight concurrency bounds (max 300 concurrent requests). When saturated, returns `503 Service Unavailable` with `Retry-After: 2` to preserve core process health rather than crashing.
2. **PostgreSQL Connection Pool Tuning:** Configured dedicated `max: 50` pool size, `statement_timeout: 2000ms`, and client checkout timeouts (`5000ms`).
3. **Multi-Core Cluster Scaling:** Leveraged Node.js native `cluster` module to spawn isolated worker processes across all available CPU cores behind an internal round-robin master IPC balancer[cite: 15].

## 3. High Concurrency Benchmark Results[cite: 15]

| Metric | Single-Core (Naive) | Multi-Core Clustered + Tuned Pools + Load Shedding |
| :--- | :--- | :--- |
| **Max Sustained Concurrency** | 85 concurrent users | **1,000+ concurrent users**[cite: 15] |
| **Throughput (Requests/sec)** | 320 req/sec | **3,850+ req/sec**[cite: 15] |
| **Latency p95** | 480 ms (severe degradation) | **18 ms**[cite: 15] |
| **Latency p99** | 1,420 ms | **42 ms**[cite: 15] |
| **Behavior Under Extreme Spike** | Node.js Process Crash (OOM) | **Zero crashes: Sheds excess requests gracefully via HTTP 503**[cite: 15] |