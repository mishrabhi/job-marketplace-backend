import express from 'express';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Task 4 Data Architect Engine Running' });
});

app.use('/api/v1', coreRouter);
app.use(errorHandler);

export default app;