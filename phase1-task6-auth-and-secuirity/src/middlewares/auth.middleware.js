import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { appError } from './errorHandler.js';

/**
 * Verifies JWT from Authorization Bearer header
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(appError(401, 'UNAUTHORIZED', 'Access token missing or malformed.'));
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return next(appError(401, 'TOKEN_EXPIRED', 'Token has expired. Please login again.'));
      }
      return next(appError(403, 'FORBIDDEN', 'Invalid authentication token.'));
    }

    req.user = decodedUser;
    next();
  });
};

/**
 * Enforces Role-Based Access Control (RBAC)
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(appError(403, 'FORBIDDEN_ROLE', 'You do not have permission to access this resource.'));
    }
    next();
  };
};