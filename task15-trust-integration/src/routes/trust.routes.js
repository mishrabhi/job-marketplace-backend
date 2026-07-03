import express from 'express';
const router = express.Router();
import * as trustController from '../controllers/trust.controller.js';

// Central pipeline test execution route 
router.post('/dry-run', trustController.triggerStabilizationDryRun);

module.exports = router;