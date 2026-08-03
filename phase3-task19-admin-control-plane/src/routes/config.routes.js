import express from 'express';
const router = express.Router();
import * as configController from '../controllers/config.controller.js';

// Update tenant white-label branding & limits[cite: 17]
router.post('/config', configController.handleUpdateConfig);

// Fetch tenant configuration[cite: 17]
router.get('/config', configController.handleGetConfig);

// Rollback configuration to a target audit log snapshot[cite: 17]
router.post('/config/rollback', configController.handleRollbackConfig);

export default router;