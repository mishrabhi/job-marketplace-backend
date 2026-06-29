import express from 'express';
import apiRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/v1', apiRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', framework: 'ES6 Modules Verified Stable' });
});

app.use(errorHandler);

export default app;