import express from 'express';
const router = express.Router();
import * as cutoverController from '../controllers/cutover.controller.js';

// Primary production cutover and launch orchestration path[cite: 16]
router.post('/production-cutover', cutoverController.processProductionCutover);

export default router;