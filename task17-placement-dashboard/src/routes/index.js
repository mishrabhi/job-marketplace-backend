import express from 'express';
const router = express.Router();
import dashboardRoutes from './dashboard.routes.js';

router.use('/dashboards', dashboardRoutes);

export default router;