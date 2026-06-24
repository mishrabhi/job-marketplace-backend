const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { appError } = require('./errorHandler');

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(appError(401, 'UNAUTHORIZED', 'Missing Authorization header'));
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return next(appError(401, 'UNAUTHORIZED', 'Bad Authorization header'));
  const token = parts[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (e) {
    return next(appError(401, 'UNAUTHORIZED', 'Invalid token'));
  }
}

module.exports = auth;
