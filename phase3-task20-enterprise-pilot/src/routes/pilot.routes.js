import express from 'express';
const router = express.Router();
import * as pilotController from '../controllers/pilot.controller.js';

// Provision pilot tenant endpoint[cite: 17]
router.post('/pilot/provision', pilotController.handleProvisionPilot);

// Execute enterprise journey step endpoint[cite: 17]
router.post('/pilot/journey/execute', pilotController.handleExecuteJourneyStep);

// Log remediation gap item endpoint[cite: 17]
router.post('/pilot/remediation/items', pilotController.handleLogRemediationItem);

// Get pilot remediation summary endpoint[cite: 17]
router.get('/pilot/remediation/summary', pilotController.handleGetRemediationSummary);

export default router;