function appError(statusCode, code, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  err.details = details;
  return err;
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = err.statusCode || 500;
  const code = err.code || 'DB_ERROR';
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

  res.status(status).json({ success: false, error: { code, message, details } });
}

module.exports = { appError, errorHandler };
