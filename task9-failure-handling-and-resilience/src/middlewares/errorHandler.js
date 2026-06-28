import logger from '../config/logger';

export default class AppError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default appError = (statusCode, code, message, details = null) => {
  return new AppError(statusCode, code, message, details);
};

export default errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || null;

  if (statusCode >= 500) {
    logger.error(`[Unhandled Error] ${message}`, {
      code,
      path: req.path,
      method: req.method,
      stack: err.stack
    });
  } else {
    logger.warn(`[Client Error] ${message}`, { code, path: req.path });
  }

  return res.status(statusCode).json({
    success: false,
    error: { code, message, details }
  });
};

