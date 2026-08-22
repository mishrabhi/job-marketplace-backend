import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';

class CacheMetrics {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.stampedesPrevented = 0;
  }

  recordHit() { this.hits++; }
  recordMiss() { this.misses++; }
  recordStampedePrevented() { this.stampedesPrevented++; }

  getSummary() {
    const total = this.hits + this.misses;
    const ratio = total > 0 ? ((this.hits / total) * 100).toFixed(2) : "0.00";
    return {
      hits: this.hits,
      misses: this.misses,
      total_requests: total,
      hit_ratio_percent: `${ratio}%`,
      stampedes_prevented: this.stampedesPrevented
    };
  }
}

export const metrics = new CacheMetrics();

/**
 * Cache-Aside with Distributed Mutex Stampede Protection[cite: 17]
 * @param {string} cacheKey - Redis key
 * @param {number} ttlSeconds - Time-To-Live in seconds[cite: 17]
 * @param {Function} dbFallbackFn - Async function to fetch data from DB if cache misses[cite: 17]
 */
export const getOrSetWithStampedeProtection = async (cacheKey, ttlSeconds, dbFallbackFn) => {
  // 1. Check Redis Cache[cite: 17]
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    metrics.recordHit();
    return { data: JSON.parse(cachedData), source: 'REDIS_CACHE_HIT' };
  }

  metrics.recordMiss();
  logger.warn(` Cache MISS on key: '${cacheKey}'. Engaging stampede protection lock.`);

  // 2. Acquire Distributed Mutex Lock (Single-Flight Pattern)[cite: 17]
  const lockKey = `lock:${cacheKey}`;
  const lockTtlMs = 5000;
  const lockAcquired = await redis.set(lockKey, 'locked', 'PX', lockTtlMs, 'NX');

  if (!lockAcquired) {
    // Another concurrent request holds the lock to fetch data. Wait and retry against cache[cite: 17]
    metrics.recordStampedePrevented();
    logger.info(`🛡️ Stampede prevented for key '${cacheKey}'. Waiting for leader to populate cache...`);

    // Poll every 50ms (up to 3 seconds) for the primary worker to finish[cite: 17]
    for (let i = 0; i < 60; i++) {
      await new Promise(res => setTimeout(res, 50));
      const retryCached = await redis.get(cacheKey);
      if (retryCached) {
        metrics.recordHit();
        return { data: JSON.parse(retryCached), source: 'REDIS_CACHE_POST_LOCK_HIT' };
      }
    }
  }

  try {
    // 3. Fallback: Query the database[cite: 17]
    const freshData = await dbFallbackFn();

    // 4. Save to Redis with TTL[cite: 17]
    if (freshData !== null && freshData !== undefined) {
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(freshData));
      logger.info(`💾 Cached key '${cacheKey}' with TTL ${ttlSeconds}s`);
    }

    return { data: freshData, source: 'DATABASE_FETCH' };
  } finally {
    // Release the stampede lock[cite: 17]
    await redis.del(lockKey);
  }
};

/**
 * Invalidate specific cache keys or patterns on mutation[cite: 17]
 */
export const invalidateCache = async (keyOrPattern) => {
  if (keyOrPattern.includes('*')) {
    const keys = await redis.keys(keyOrPattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Invalidated ${keys.length} cache keys matching '${keyOrPattern}'`);
    }
  } else {
    await redis.del(keyOrPattern);
    logger.info(`Invalidated cache key '${keyOrPattern}'`);
  }
};