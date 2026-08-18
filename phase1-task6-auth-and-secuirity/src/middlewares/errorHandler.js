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
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'Authentication service exception caught';
  let details = err.details || null;

  if (err.code === '23505') {
    statusCode = 409;
    code = 'DUPLICATE_EMAIL';
    message = 'An account with this email address already exists.';
  }

  logger.error(`[Auth Error] ${message}`, { code, details, stack: err.stack });

  return res.status(statusCode).json({
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  });
};