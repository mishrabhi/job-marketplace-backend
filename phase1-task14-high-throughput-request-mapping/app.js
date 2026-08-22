import express from 'express';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    throughput_engine: 'Clustered Node.js + Adaptive Load Shedding Active',
    pid: process.pid,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1', coreRouter);
app.use(errorHandler);

export default app;