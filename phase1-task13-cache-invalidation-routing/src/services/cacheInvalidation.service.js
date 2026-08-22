import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';

/**
 * Stores cached data and binds the key to associated entity tags for targeted invalidation[cite: 18]
 */
export const setCachedWithTags = async (cacheKey, value, tags = [], ttlSeconds = 300) => {
  const pipeline = redis.pipeline();

  // 1. Store cache payload with TTL[cite: 18]
  pipeline.setex(cacheKey, ttlSeconds, JSON.stringify(value));

  // 2. Track key membership inside tag sets[cite: 18]
  tags.forEach(tag => {
    pipeline.sadd(`tag:${tag}`, cacheKey);
    pipeline.expire(`tag:${tag}`, ttlSeconds + 60); // Keep tag set slightly longer than key
  });

  await pipeline.exec();
  logger.debug(`💾 Cache stored: '${cacheKey}' registered under tags: [${tags.join(', ')}]`);
};

/**
 * Retrieves cached data[cite: 18]
 */
export const getCached = async (cacheKey) => {
  const raw = await redis.get(cacheKey);
  return raw ? JSON.parse(raw) : null;
};

/**
 * Write-Path Hook: Evicts precise cache keys using associated tags without over-evicting unrelated keys[cite: 18]
 */
export const invalidateTags = async (tags = []) => {
  if (!tags.length) return;

  const allKeysToEvict = new Set();

  for (const tag of tags) {
    const tagKey = `tag:${tag}`;
    const members = await redis.smembers(tagKey);
    members.forEach(k => allKeysToEvict.add(k));
    allKeysToEvict.add(tagKey);
  }

  if (allKeysToEvict.size > 0) {
    const keysArray = Array.from(allKeysToEvict);
    await redis.del(...keysArray);
    logger.info(`[Invalidation Hook] Successfully evicted ${keysArray.length} keys for tags: [${tags.join(', ')}]`);
  }
};