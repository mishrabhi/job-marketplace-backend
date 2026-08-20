import { logger } from '../config/logger.js';

export class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const appError = (statusCode, code, message) => new AppError(statusCode, code, message);

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Queue dispatch runtime exception caught';

  logger.error(`[Queue Intercept] ${message}`, { code, stack: err.stack });

  return res.status(statusCode).json({
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString()
  });
};