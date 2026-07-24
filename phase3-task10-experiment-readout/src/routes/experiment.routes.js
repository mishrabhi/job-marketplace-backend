import express from 'express';
const router = express.Router();
import * as expController from '../controllers/experiment.controller.js';

// Record conversion outcome for an experiment[cite: 19]
router.post('/outcomes', expController.handleRecordOutcome);

// Get experiment readout analytics with SRM detection[cite: 19]
router.get('/readout', expController.handleGetReadout);

// Execute zombie-flag cleanup process[cite: 19]
router.post('/cleanup-zombies', expController.handleCleanupZombieFlags);

export default router;