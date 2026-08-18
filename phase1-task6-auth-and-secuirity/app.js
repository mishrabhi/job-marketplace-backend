import express from 'express';
import helmet from 'helmet';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

// Security Headers Middleware
app.use(helmet());
app.use(express.json());

// Readiness Health Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    auth_engine: 'JWT + BCrypt + RBAC Active',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', coreRouter);
app.use(errorHandler);

export default app;