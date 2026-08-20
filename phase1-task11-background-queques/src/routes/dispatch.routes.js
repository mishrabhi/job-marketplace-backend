import express from 'express';
import * as dispatchController from '../controllers/dispatch.controller.js';

const router = express.Router();

router.post('/email', dispatchController.handleEnqueueEmail);
router.get('/metrics', dispatchController.handleGetMetrics);

export default router;