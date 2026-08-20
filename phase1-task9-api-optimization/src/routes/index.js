import express from 'express';
import candidateRoutes from './candidate.routes.js';

const router = express.Router();

router.use('/candidates', candidateRoutes);

export default router;