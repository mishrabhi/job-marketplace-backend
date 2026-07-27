import express from 'express';
const router = express.Router();
import * as featureController from '../controllers/feature.controller.js';

// Retrieve candidate features[cite: 19]
router.get('/features', featureController.handleGetFeatures);

// Upsert candidate features[cite: 19]
router.post('/features', featureController.handleUpsertFeatures);

// Invalidate feature cache[cite: 19]
router.post('/cache/invalidate', featureController.handleInvalidateCache);

export default router;