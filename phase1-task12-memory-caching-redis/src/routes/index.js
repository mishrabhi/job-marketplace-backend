import express from 'express';
import driveCacheRoutes from './driveCache.routes.js';

const router = express.Router();

router.use('/cache-demo', driveCacheRoutes);

export default router;