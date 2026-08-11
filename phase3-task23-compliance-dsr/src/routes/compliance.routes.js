import express from 'express';
const router = express.Router();
import * as complianceController from '../controllers/compliance.controller.js';

// Submit a new DSR request (Export, Deletion, Correction)[cite: 18]
router.post('/dsr/submit', complianceController.handleSubmitDSR);

// Execute Right to be Forgotten cascading purge[cite: 18]
router.post('/dsr/execute-purge', complianceController.handleExecutePurge);

// Export Data Subject Data (SAR)[cite: 18]
router.get('/dsr/export', complianceController.handleExportData);

export default router;