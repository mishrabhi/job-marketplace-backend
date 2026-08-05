import express from 'express';
const router = express.Router();
import * as securityController from '../controllers/security.controller.js';

// Record STRIDE threat model entry[cite: 16]
router.post('/stride/threats', securityController.handleLogStrideThreat);

// Execute IDOR attack defense test[cite: 16]
router.post('/pen-test/idor-check', securityController.handleTestIdorDefense);

// Execute supply-chain dependency security scan[cite: 16]
router.post('/supply-chain/scan', securityController.handleAuditSupplyChain);

export default router;