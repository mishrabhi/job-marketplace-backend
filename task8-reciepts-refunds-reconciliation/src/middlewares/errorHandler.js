import ZodError from 'zod';

/**
 * appError — structured error factory.
 * Usage: throw appError(409, 'DUPLICATE_RECEIPT', 'Receipt already issued for this payment')
 */
export default appError = (statusCode, code, message, details = {}) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  err.details = details;
  return err;
};

/**
 * Global error handler — must be the last middleware in app.js
 */
export default errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors,
      },
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
        details: err.details || {},
      },
    });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
    },
  });
};
