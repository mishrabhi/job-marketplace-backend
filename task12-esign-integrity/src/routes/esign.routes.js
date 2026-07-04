import express from 'express';
const router = express.Router();
import * as esignController from '../controllers/esign.controller.js';

router.post('/sign', esignController.processDigitalSignature);
router.get('/verify-audit', esignController.runIndependentAuditVerification);

export default router;