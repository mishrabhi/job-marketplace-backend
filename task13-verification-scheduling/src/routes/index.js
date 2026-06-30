import express from 'express';
const router = express.Router();
import verificationRoutes from './verification.routes.js';
import schedulingRoutes from './scheduling.routes.js';

router.use('/verification', verificationRoutes);
router.use('/interviews', schedulingRoutes);

export default router;