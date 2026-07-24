import express from 'express';
const router = express.Router();
import experimentRoutes from './experiment.routes.js';

router.use('/growth-analytics', experimentRoutes);

export default router;