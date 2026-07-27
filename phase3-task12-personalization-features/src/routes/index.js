import express from 'express';
const router = express.Router();
import featureRoutes from './feature.routes.js';

router.use('/personalization', featureRoutes);

export default router;