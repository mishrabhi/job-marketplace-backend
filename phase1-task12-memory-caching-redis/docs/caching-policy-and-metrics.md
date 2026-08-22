# Redis Caching Strategy & Stampede Protection 

## 1. Data Type Caching Policy & TTL Matrix

| Data Entity / Query | Cache Key Pattern | TTL | Invalidation Trigger | Stampede Protected |
| :--- | :--- | :--- | :--- | :--- |
| **Placement Drives List (Hot Feed)** | `placemux:drives:hot_feed` | 120s (2m) | On drive created/updated | Yes (Distributed Mutex) |
| **Placement Drive Detail** | `placemux:drive:<id>` | 300s (5m) | On drive status update | Yes (Distributed Mutex) |
| **Student Eligibility Profile** | `placemux:student:<id>:eligibility` | 60s (1m) | On student GPA change | No |

## 2. Cache Stampede (Thundering Herd) Protection
When a hot key expires and hundreds of concurrent requests arrive simultaneously, standard cache-aside triggers a thundering herd against the database. 
* **Protection Mechanism:** Implemented `fetchWithStampedeLock` using Redis `SET key lock NX PX 5000` distributed locking.
* **Single Flight:** Exactly **one** worker acquires the lock to query the DB and repopulate Redis, while concurrent callers wait and retry against the freshly populated cache.

## 3. Hit Ratio Metrics Engine
* Tracks cumulative `hits`, `misses`, `stamps_prevented`, and live `hit_ratio_percent` in real-time.