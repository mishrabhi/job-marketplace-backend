import { cache } from '../config/cache.js';
import { env } from '../config/env.js';

export const cacheMiddleware = (ttlSeconds = env.CACHE_DEFAULT_TTL_SEC) => {
  return (req, res, next) => {
    // Only cache GET requests[cite: 14]
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `cache:${req.originalUrl || req.url}`;
    const cachedBody = cache.get(cacheKey);

    if (cachedBody) {
      res.setHeader('X-Cache-Status', 'HIT');
      return res.status(200).json(cachedBody);
    }

    res.setHeader('X-Cache-Status', 'MISS');

    // Override res.json to capture and store payload into cache[cite: 14]
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, body, ttlSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};