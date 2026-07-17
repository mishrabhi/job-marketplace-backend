import express from 'express';
import globalRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.use('/api/v1', globalRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', infrastructure: 'Profiling Optimization Engine Stable' });
});

app.use(errorHandler);

export default app;