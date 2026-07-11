import express from 'express';
const router = express.Router();
import * as hardeningController from '../controllers/hardening.controller.js';
import { globalRateLimiter } from '../middlewares/rateLimiter.js';

// MLOps Telemetry analytics aggregation endpoints protected by rate limiting
router.post('/mlops/inference', globalRateLimiter, hardeningController.recordModelTelemetry);

// Load test scale performance ledger update endpoints
router.post('/scale/load-metrics', globalRateLimiter, hardeningController.archivePerformanceMetrics);

export default router;