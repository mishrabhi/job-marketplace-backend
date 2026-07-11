import { env } from '../config/env.js';
import { appError } from './errorHandler.js';

const cacheMemoryStore = new Map();

/**
 * Resilient in-memory sliding scale protection rate-limiter
 */
export const globalRateLimiter = (req, res, next) => {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown-ip';
  const currentTime = Date.now();
  
  if (!cacheMemoryStore.has(clientIp)) {
    cacheMemoryStore.set(clientIp, []);
  }

  const trackingTimestamps = cacheMemoryStore.get(clientIp);
  const strictExpirationBound = currentTime - env.GLOBAL_RATE_LIMIT_WINDOW_MS;

  // Filter out request timestamps that fall outside the current window configuration
  const activeWindowRequests = trackingTimestamps.filter(timestamp => timestamp > strictExpirationBound);
  
  if (activeWindowRequests.length >= env.GLOBAL_RATE_LIMIT_MAX) {
    return next(appError(429, 'TOO_MANY_REQUESTS', 'Rate limit exceeded. System burst thresholds protection triggered.'));
  }

  activeWindowRequests.push(currentTime);
  cacheMemoryStore.set(clientIp, activeWindowRequests);

  res.setHeader('X-RateLimit-Limit', env.GLOBAL_RATE_LIMIT_MAX);
  res.setHeader('X-RateLimit-Remaining', env.GLOBAL_RATE_LIMIT_MAX - activeWindowRequests.length);

  next();
};