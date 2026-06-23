import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Authorization header missing or invalid');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    return next(err);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    error.status = 401;
    error.code = 'UNAUTHORIZED';
    error.message = 'Invalid or expired token';
    next(error);
  }
}
