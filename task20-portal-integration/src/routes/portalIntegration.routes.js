import express from 'express';
const router = express.Router();
import * as portalIntegrationController from '../controllers/portalIntegration.controller.js';

// Central cross-portal pipeline orchestration validation test path 
router.post('/validate-dry-run', portalIntegrationController.triggerPortalEcosystemDryRun);

export default router;