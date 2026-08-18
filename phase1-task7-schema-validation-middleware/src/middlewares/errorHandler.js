import { logger } from '../config/logger.js';

export class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const appError = (statusCode, code, message, details = null) => new AppError(statusCode, code, message, details);

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Validation service runtime exception caught';
  const details = err.details || null;

  logger.warn(`[Validation Guard] ${message}`, { code, details });

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString()
  });
};