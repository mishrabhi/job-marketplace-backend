import express from 'express';
const router = express.Router();
import * as certController from '../controllers/certification.controller.js';

router.post('/certification/pack', certController.handleGenerateCertPack);
router.post('/cutover/execute', certController.handleExecuteCutover);
router.post('/post-launch/backlog', certController.handleRecordBacklog);
router.get('/status', certController.handleGetCertStatus);

export default router;