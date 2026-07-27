import express from 'express';
const router = express.Router();
import * as rankerController from '../controllers/ranker.controller.js';

// Serve candidate rankings with shadow/canary evaluation[cite: 19]
router.post('/rank', rankerController.handleServeRankings);

// Configure model deployment mode and canary percentage[cite: 19]
router.post('/deployments/configure', rankerController.handleConfigureDeployment);

// Manually or automatically rollback a canary model[cite: 19]
router.post('/deployments/rollback', rankerController.handleTriggerRollback);

export default router;