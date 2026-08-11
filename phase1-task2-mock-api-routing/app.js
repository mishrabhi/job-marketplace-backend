import express from 'express';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

// Health route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    mock_mode: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', coreRouter);

// Global Error Handler
app.use(errorHandler);

export default app;