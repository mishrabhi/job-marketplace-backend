import express from 'express';
import errorHandler from './middlewares/errorHandler.js';
import companyRoutes from './routes/company.routes.js';
import jobRoutes from './routes/job.routes.js';
import thresholdRoutes from './routes/threshold.routes.js';
import searchRoutes from './routes/search.routes.js';
import discoveryRoutes from './routes/discovery.routes.js';
import applicationRoutes from './routes/application.routes.js';
import shortlistRoutes from './routes/shortlist.routes.js';
import HealthController from './controllers/health.controller.js';

const app = express();

// Middleware
app.use(express.json());

// API Routes
const apiV1 = express.Router();

apiV1.use('/companies', companyRoutes);
apiV1.use('/jobs', jobRoutes);
apiV1.use('/threshold', thresholdRoutes);
apiV1.use('/search', searchRoutes);
apiV1.use('/discovery', discoveryRoutes);
apiV1.use('/applications', applicationRoutes);
apiV1.use('/shortlists', shortlistRoutes);

// Health endpoints
apiV1.get('/health', HealthController.health);
apiV1.get('/health/ready', HealthController.ready);

app.use('/api/v1', apiV1);

// Error handler
app.use(errorHandler);

export default app;
