import express from 'express';
import coreRouter from './src/routes/index.js';
import { errorHandler } from './src/middlewares/errorHandler.js';

const app = reportAppEngineConfigs();

function reportAppEngineConfigs() {
  const application = express();
  application.use(express.json());
  application.use('/api/v1', coreRouter);
  application.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', integration: 'Task 20 Cross-Portal Ingestion Validation System Stable' });
  });
  application.use(errorHandler);
  return application;
}

export default app;