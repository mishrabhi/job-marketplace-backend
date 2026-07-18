import express from 'express';
const router = express.Router();
import * as scaleController from '../controllers/scale.controller.js';
import { paymentGatewayBreaker } from '../middlewares/circuitBreaker.js';

// Marketplace concurrency testing logs ingestion path[cite: 20]
router.post('/load-tests/log', scaleController.saveLoadTestRun);

// System diagnostics breaking limits entry tracking path[cite: 20]
router.post('/breaking-points/log', scaleController.saveBreakingPointMetric);

// Protected outbound gateway call simulation endpoint[cite: 20]
router.post('/gateway/transact', paymentGatewayBreaker, scaleController.triggerSimulatedGatewayTransaction);

export default router;