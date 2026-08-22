import { redis } from '../config/redis.js';
import { logger } from '../config/logger.js';

const STRIKE_WINDOW_SECONDS = 300;  // 5 minutes rolling window
const MAX_STRIKES = 3;              // Maximum allowable rate limit breaches
const QUARANTINE_DURATION_SECONDS = 900; // 15 minutes ban

export const abuseDetector = {
  /**
   * Checks if an IP is actively blacklisted
   */
  isBlacklisted: async (ip) => {
    const isBanned = await redis.get(`blacklist:${ip}`);
    return Boolean(isBanned);
  },

  /**
   * Records a strike against an IP upon rate-limit exhaustion[cite: 16]
   */
  recordStrike: async (ip) => {
    const strikeKey = `strikes:${ip}`;
    const strikes = await redis.incr(strikeKey);

    if (strikes === 1) {
      await redis.expire(strikeKey, STRIKE_WINDOW_SECONDS);
    }

    logger.warn(`Abuse detector: Strike ${strikes}/${MAX_STRIKES} recorded for IP: ${ip}`);

    if (strikes >= MAX_STRIKES) {
      logger.error(`⛔ IP ${ip} exceeded strike threshold. Placing into 15-minute QUARANTINE blacklist!`);
      await redis.setex(`blacklist:${ip}`, QUARANTINE_DURATION_SECONDS, 'QUARANTINED_ABUSE');
      await redis.del(strikeKey);
    }
  }
};