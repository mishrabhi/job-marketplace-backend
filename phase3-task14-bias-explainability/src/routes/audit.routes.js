import express from 'express';
const router = express.Router();
import * as auditController from '../controllers/audit.controller.js';

// Record an automated decision into immutable audit log[cite: 18]
router.post('/decisions/log', auditController.handleLogDecision);

// Get decision explanation[cite: 18]
router.get('/decisions/explain', auditController.handleGetExplanation);

// Candidate appeal submission endpoint[cite: 18]
router.post('/appeals/submit', auditController.handleSubmitAppeal);

// Human reviewer appeal adjudication endpoint[cite: 18]
router.post('/appeals/adjudicate', auditController.handleAdjudicateAppeal);

export default router;