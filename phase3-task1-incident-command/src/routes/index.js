import express from 'express';
const router = express.Router();
import incidentRoutes from './incident.routes.js';

router.use('/sre', incidentRoutes);

export default router;