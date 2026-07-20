import express from 'express';
const router = express.Router();
import * as outboxController from '../controllers/outbox.controller.js';

// Publish a versioned event to the outbox[cite: 19]
router.post('/events/emit', outboxController.stageEventEmission);

// Process pending outbox events into analytics[cite: 19]
router.post('/outbox/process', outboxController.triggerOutboxWorker);

// Replay events from a specific sequence offset[cite: 19]
router.get('/events/replay', outboxController.executeStreamReplay);

export default router;