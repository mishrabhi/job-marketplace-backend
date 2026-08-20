import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    logger.warn(`Socket connection rejected: Missing auth token for socket ${socket.id}`);
    return next(new Error('AUTHENTICATION_ERROR: Token required'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    socket.user = decoded; // Attach user claims to socket instance
    next();
  } catch (err) {
    logger.warn(`Socket connection rejected: Invalid token (${err.message}) for socket ${socket.id}`);
    return next(new Error('AUTHENTICATION_ERROR: Invalid or expired token'));
  }
};