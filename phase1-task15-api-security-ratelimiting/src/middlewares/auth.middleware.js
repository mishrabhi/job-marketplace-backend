import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { appError } from './errorHandler.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(appError(401, 'UNAUTHORIZED', 'Access token missing or malformed.'));
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(appError(403, 'FORBIDDEN_TOKEN', 'Token invalid or expired.'));
    }
    req.user = user;
    next();
  });
};