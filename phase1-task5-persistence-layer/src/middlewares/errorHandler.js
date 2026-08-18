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
  let message = err.message || 'Persistence layer exception caught';
  let details = err.details || null;

  // Postgres Database Error Code Mapping
  if (err.code === '23505') {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'A record with these unique constraints already exists.';
    details = err.detail;
  } else if (err.code === '23503') {
    statusCode = 400;
    code = 'FOREIGN_KEY_VIOLATION';
    message = 'The referenced parent entity does not exist.';
    details = err.detail;
  } else if (err.code === '23514') {
    statusCode = 400;
    code = 'CHECK_CONSTRAINT_FAILED';
    message = 'Supplied data violates column check constraints (e.g. GPA range or positive count).';
    details = err.detail;
  } else if (err.code === '57P01') {
    statusCode = 503;
    code = 'DB_CONNECTION_TERMINATED';
    message = 'Database server terminated connection.';
  }

  logger.error(`[DB Handler Intercept] ${message}`, { code, details, stack: err.stack });

  return res.status(statusCode).json({
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString()
  });
};