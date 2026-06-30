import express from 'express';
const router = express.Router();
import * as verificationController from '../controllers/verification.controller.js';

router.get('/public-verify', verificationController.runPublicLookup);

export default router;