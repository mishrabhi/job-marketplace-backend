import express from 'express';
const router = express.Router();
import * as finopsController from '../controllers/finops.controller.js';

// Record workload cost attribution[cite: 17]
router.post('/costs/record', finopsController.handleRecordWorkloadCost);

// Compute unit economics summary[cite: 17]
router.post('/unit-economics/compute', finopsController.handleComputeUnitEconomics);

export default router;