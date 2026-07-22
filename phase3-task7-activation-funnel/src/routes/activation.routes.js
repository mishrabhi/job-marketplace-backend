import express from 'express';
const router = express.Router();
import * as activationController from '../controllers/activation.controller.js';

// Fast signup activation path[cite: 19]
router.post('/signup', activationController.handleFastSignup);

// Forgiving profile completion path[cite: 19]
router.post('/profile', activationController.handleProfileCompletion);

// Activation funnel success rate metrics[cite: 19]
router.get('/metrics', activationController.getActivationFunnelTelemetry);

export default router;