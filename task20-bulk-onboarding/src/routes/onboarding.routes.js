import express from 'express';
const router = express.Router();
import * as onboardingController from '../controllers/onboarding.controller.js';

// Bulk batch roster processing route [cite: 1056, 1119]
router.post('/roster-upload', onboardingController.processCohortIngestion);

export default router;