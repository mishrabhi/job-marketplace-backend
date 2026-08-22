import express from 'express';
import * as driveCacheController from '../controllers/driveCache.controller.js';

const router = express.Router();

router.get('/drives/hot', driveCacheController.handleGetHotDrives);
router.get('/drives/:id', driveCacheController.handleGetDriveById);
router.patch('/drives/:id/status', driveCacheController.handleUpdateDriveStatus);
router.get('/metrics', driveCacheController.handleGetCacheMetrics);

export default router;