import express from 'express';
const router = express.Router();
import * as partnerController from '../controllers/partner.controller.js';
import { authenticatePartnerApiKey } from '../middlewares/partnerAuth.js';

// Register partner API credentials[cite: 18]
router.post('/register', partnerController.handleRegisterPartner);

// Dispatch signed webhook (Requires Partner API key)[cite: 18]
router.post('/webhooks/trigger', authenticatePartnerApiKey, partnerController.handleTriggerWebhook);

// Partner verification helper endpoint[cite: 18]
router.post('/webhooks/verify', partnerController.handleVerifySignature);

export default router;