import express from 'express';
import jobRoutes from './job.routes.js';
import candidateRoutes from './candidate.routes.js';

const router = express.Router();

router.use('/jobs', jobRoutes);
router.use('/candidates', candidateRoutes);

export default router;