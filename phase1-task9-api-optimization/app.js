import express from 'express';
import coreRouter from './src/routes/index.js';
import { requestProfiler } from './src/middlewares/profiling.middleware.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

// Attach Profiling Middleware globally[cite: 14]
app.use(requestProfiler);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    engine: 'API Optimization & Caching Engine Running',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', coreRouter);
app.use(errorHandler);

export default app;