import express from 'express';
const router = express.Router();
import * as flagController from '../controllers/flag.controller.js';

// Evaluate feature flag / experiment variant[cite: 19]
router.post('/evaluate', flagController.handleEvaluateFlag);

// Register a new feature flag[cite: 19]
router.post('/register', flagController.handleCreateFlag);

// Instantly toggle kill switch state[cite: 19]
router.post('/kill-switch', flagController.handleKillSwitch);

export default router;