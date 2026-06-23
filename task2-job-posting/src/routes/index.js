import express from 'express';
import jobRoutes from './job.routes.js';
import thresholdRoutes from './threshold.routes.js';

const router = express.Router();

router.use('/jobs', jobRoutes);
router.use('/threshold', thresholdRoutes);

export default router;
