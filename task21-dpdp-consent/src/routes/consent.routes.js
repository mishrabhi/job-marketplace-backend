import express from 'express';
const router = express.Router();
import * as consentController from '../controllers/consent.controller.js';

// Record and manage user granular consent grants 
router.post('/register', consentController.updateConsentRegistry);

// Comply with explicit right-to-be-forgotten erasure requests 
router.post('/purge-data', consentController.executeSubjectPurgeRequest);

export default router;