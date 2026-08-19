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
  let message = err.message || 'Relationship runtime exception intercepted';

  if (err.code === '23503') {
    statusCode = 409;
    code = 'FOREIGN_KEY_RESTRICT_VIOLATION';
    message = 'Cannot delete or alter entity because active dependent records exist.';
  } else if (err.code === '23505') {
    statusCode = 409;
    code = 'DUPLICATE_RELATION';
    message = 'This student has already applied for this job opening.';
  }

  logger.error(`[Data Relationship Error] ${message}`, { code, stack: err.stack });

  return res.status(statusCode).json({
    success: false,
    error: { code, message, details: err.details || null },
    timestamp: new Date().toISOString()
  });
};