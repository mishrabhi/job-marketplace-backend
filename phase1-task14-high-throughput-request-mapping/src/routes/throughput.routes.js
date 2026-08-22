import express from 'express';
import * as throughputController from '../controllers/throughput.controller.js';
import { loadShedder } from '../middlewares/loadShedding.middleware.js';

const router = express.Router();

// Protected with adaptive load shedding[cite: 15]
router.get('/fast-batch-feed', loadShedder, throughputController.handleGetBatchFeed);
router.get('/telemetry', throughputController.handleGetTelemetry);

export default router;