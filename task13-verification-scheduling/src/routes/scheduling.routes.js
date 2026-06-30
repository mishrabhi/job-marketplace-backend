import express from 'express';
const router = express.Router();
import * as schedulingController from '../controllers/scheduling.controller.js';

router.post('/schedule', schedulingController.executeSlotAllocation);

export default router;