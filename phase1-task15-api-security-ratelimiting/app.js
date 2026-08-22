import express from 'express';
import { securityHeaders } from './src/middlewares/securityHeaders.js';
import { corsMiddleware } from './src/middlewares/cors.config.js';
import { checkAbuseBlacklist } from './src/middlewares/rateLimiter.middleware.js';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

// 1. Enforce Helmet HTTP Security Headers[cite: 16]
app.use(securityHeaders);

// 2. Strict CORS Configuration[cite: 16]
app.use(corsMiddleware);

// 3. Body Parsing
app.use(express.json());

// 4. Abuse Blacklist Gatekeeper[cite: 16]
app.use(checkAbuseBlacklist);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    security_engine: 'Distributed Redis Rate Limiter + Helmet + Abuse Blacklisting Active',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api', coreRouter);
app.use(errorHandler);

export default app;