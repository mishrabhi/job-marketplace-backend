import express from 'express';
const router = express.Router();
import * as drController from '../controllers/dr.controller.js';

// Register a backup snapshot[cite: 19]
router.post('/snapshots', drController.handleCreateSnapshot);

// Trigger DR restore drill and measure RTO/RPO[cite: 19]
router.post('/restore-drills', drController.handleExecuteRestore);

// Log chaos testing simulation[cite: 19]
router.post('/chaos/simulate', drController.handleLogChaos);

// Get DR runbook summary & SLA metrics[cite: 19]
router.get('/summary', drController.handleGetDRSummary);

export default router;