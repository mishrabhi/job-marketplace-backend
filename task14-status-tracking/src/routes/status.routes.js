import express from 'express';
const router = express.Router();
import * as statusController from '../controllers/status.controller.js';

router.post('/update', statusController.modifyApplicationState);
router.get('/timeline', statusController.retrieveCandidateTimeline);

export default router;