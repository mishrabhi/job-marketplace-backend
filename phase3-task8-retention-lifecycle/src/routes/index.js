import express from 'express';
const router = express.Router();
import retentionRoutes from './retention.routes.js';

router.use('/retention', retentionRoutes);

export default router;