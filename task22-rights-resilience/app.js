import express from 'express';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/v1', coreRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', framework: 'Task 22 Rights Core Online' });
});

app.use(errorHandler);

export default app;