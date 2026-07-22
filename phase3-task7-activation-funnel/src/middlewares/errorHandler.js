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
  const message = err.message || 'Activation pipeline exception intercepted';
  const details = err.details || null;

  logger.error(`[Activation Funnel Exception] ${message}`, { code, details, stack: err.stack });

  // Actionable API error responses for UI guidance
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
      actionable_guidance: getActionableGuidance(code)
    }
  });
};

function getActionableGuidance(code) {
  switch (code) {
    case 'DUPLICATE_EMAIL':
      return 'An account with this email already exists. Try signing in or resetting your password.';
    case 'INVALID_INPUT':
      return 'Please review the highlighted fields and ensure correct formatting.';
    case 'TENANT_ACCESS_DENIED':
      return 'Your user context does not match the requested college tenant domain.';
    default:
      return 'Please try again. If the issue persists, contact technical support.';
  }
}