import express from 'express';
const router = express.Router();
import * as retentionController from '../controllers/retention.controller.js';

// Update or record user engagement state[cite: 19]
router.post('/lifecycle/state', retentionController.handleStateUpdate);

// Get user engagement lifecycle status[cite: 19]
router.get('/lifecycle/state', retentionController.handleGetLifecycleState);

// Trigger DPDP-compliant re-engagement notification[cite: 19]
router.post('/notifications/trigger', retentionController.handleReengagementTrigger);

export default router;