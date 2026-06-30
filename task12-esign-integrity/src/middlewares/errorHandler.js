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
  const message = err.message || 'An unexpected exception occurred';

  logger.error(`[Task 12 Error Capture] ${message}`, { code, stack: err.stack });

  return res.status(statusCode).json({
    success: false,
    error: { code, message }
  });
};