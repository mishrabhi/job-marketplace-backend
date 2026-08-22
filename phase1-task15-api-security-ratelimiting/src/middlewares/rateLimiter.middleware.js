import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis } from '../config/redis.js';
import { abuseDetector } from '../services/abuseDetector.service.js';
import { appError } from './errorHandler.js';

/**
 * Global Gatekeeper: Rejects quarantined abusive IPs immediately[cite: 16]
 */
export const checkAbuseBlacklist = async (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const isBanned = await abuseDetector.isBlacklisted(clientIp);

  if (isBanned) {
    return next(appError(403, 'IP_QUARANTINED', 'Your IP address has been temporarily banned due to repeated abuse.'));
  }

  next();
};

/**
 * Sensitive Authentication Limiter (5 requests per 1 minute per IP)[cite: 16]
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:auth:'
  }),
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  handler: async (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    await abuseDetector.recordStrike(clientIp);
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again in 60 seconds.'
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Public Tier Limiter (30 requests per 1 minute per IP)[cite: 16]
 */
export const publicTierLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:public:'
  }),
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: {
        code: 'PUBLIC_QUOTA_EXCEEDED',
        message: 'Public endpoint quota reached. Limit: 30 requests/minute.'
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Authenticated User Tier Limiter (120 requests per minute by User ID)[cite: 16]
 */
export const authenticatedTierLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: 'rl:user:'
  }),
  keyGenerator: (req) => (req.user?.userId ? `user_${req.user.userId}` : req.ip),
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: {
        code: 'USER_QUOTA_EXCEEDED',
        message: 'Authenticated user throughput quota reached. Limit: 120 requests/minute.'
      },
      timestamp: new Date().toISOString()
    });
  }
});