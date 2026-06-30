import express from 'express';
import baseRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/v1', baseRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', framework: 'Task 13 Routing Pipeline Open' });
});

app.use(errorHandler);

export default app;