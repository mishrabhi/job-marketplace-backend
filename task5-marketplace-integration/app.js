import express from 'express';
import companyRoutes from './src/routes/company.routes.js';
import jobRoutes from './src/routes/job.routes.js';
import thresholdRoutes from './src/routes/threshold.routes.js';
import searchRoutes from './src/routes/search.routes.js';
import discoveryRoutes from './src/routes/discovery.routes.js';
import applicationRoutes from './src/routes/application.routes.js';
import shortlistRoutes from './src/routes/shortlist.routes.js';
import healthController from './src/controllers/health.controller.js';
import errorHandler from './src/middlewares/errorHandler.js';
import env from './src/config/env.js';
import pool from './src/config/db.js';

const app = express();

app.use(express.json());

// Mount all routes from Tasks 1-4
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/threshold', thresholdRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/shortlists', shortlistRoutes);

// Health endpoints
app.get('/health', healthController.health);
app.get('/health/ready', healthController.ready);

// Global error handler
app.use(errorHandler);

export { app, pool };
