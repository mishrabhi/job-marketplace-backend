import express from 'express';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

// Readiness & Health Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    architecture: 'Standardized 4-Tier Decoupled Layering',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', coreRouter);

// Global Standardized Error Handler
app.use(errorHandler);

export default app;