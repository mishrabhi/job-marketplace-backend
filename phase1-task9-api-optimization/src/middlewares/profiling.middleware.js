import { logger } from '../config/logger.js';

export const requestProfiler = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    res.setHeader('X-Response-Time', `${timeInMs}ms`);

    logger.debug(`[Profiler] ${req.method} ${req.originalUrl} - ${res.statusCode} in ${timeInMs}ms`);
  });

  next();
};