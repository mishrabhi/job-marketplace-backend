import express from 'express';
const router = express.Router();
import * as launchController from '../controllers/launch.controller.js';

// Bug bash blocker clearance paths[cite: 15]
router.post('/blockers/clear', launchController.clearRehearsalBlocker);

// Data retention enforcement pipelines[cite: 15]
router.post('/retention/apply', launchController.triggerRetentionPolicy);

export default router;