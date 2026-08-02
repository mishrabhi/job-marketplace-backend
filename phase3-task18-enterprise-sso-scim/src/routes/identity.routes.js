import express from 'express';
const router = express.Router();
import * as identityController from '../controllers/identity.controller.js';
import { authenticateSCIMBearer } from '../middlewares/scimAuth.js';

// Configure SSO policy endpoint[cite: 18]
router.post('/sso/configure', identityController.handleConfigureSSO);

// SCIM 2.0 User Provisioning (Joiner)[cite: 18]
router.post('/scim/v2/Users', authenticateSCIMBearer, identityController.handleSCIMProvision);

// SCIM 2.0 User Deprovisioning (Leaver)[cite: 18]
router.delete('/scim/v2/Users', authenticateSCIMBearer, identityController.handleSCIMDeprovision);

// Session access revocation check endpoint[cite: 18]
router.get('/session/validate', identityController.handleValidateSession);

export default router;