import cors from 'cors';
import { env } from '../config/env.js';
import { appError } from './errorHandler.js';

const allowedOrigins = env.ALLOWED_ORIGINS.split(',');

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. Postman, curl) with no origin header
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(appError(403, 'CORS_POLICY_VIOLATION', `Origin '${origin}' not allowed by CORS policy.`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours preflight cache
});