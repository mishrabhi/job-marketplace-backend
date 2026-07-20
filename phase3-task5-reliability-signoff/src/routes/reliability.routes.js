import express from 'express';
const router = express.Router();
import * as reliabilityController from '../controllers/reliability.controller.js';

// Execute concurrency correctness assertions route[cite: 21]
router.post('/concurrency/test', reliabilityController.runConcurrencyValidation);

// Commit Sprint A reliability sign-off route[cite: 21]
router.post('/signoff/commit', reliabilityController.executeScaleSignoff);

export default router;