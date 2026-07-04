import express from 'express';
const router = express.Router();
import * as dashboardController from '../controllers/dashboard.controller.js';

// Primary extended analytical reporting view endpoint 
router.get('/analytics', dashboardController.getCollegeDashboardMetrics);

export default router;