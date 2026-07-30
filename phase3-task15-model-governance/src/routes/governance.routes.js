import express from 'express';
const router = express.Router();
import * as govController from '../controllers/governance.controller.js';

// Invoke model surface with governance and timeout enforcement[cite: 18]
router.post('/invoke', govController.handleInvokeModel);

// Configure model version pinning and governance policies[cite: 18]
router.post('/policies', govController.handleSetPolicy);

export default router;