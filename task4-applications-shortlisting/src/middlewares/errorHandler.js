export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const details = err.details || {};

  res.status(status).json({
    success: false,
    error: { code, message, details }
  });
}
