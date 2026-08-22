import express from 'express';
import * as appController from '../controllers/application.controller.js';

const router = express.Router();

router.get('/jobs/:jobId/applications', appController.handleGetJobApplications);
router.get('/applications/:id', appController.handleGetApplicationById);
router.patch('/applications/:id/status', appController.handleUpdateStatus);
router.post('/applications', appController.handleCreateApplication);

export default router;