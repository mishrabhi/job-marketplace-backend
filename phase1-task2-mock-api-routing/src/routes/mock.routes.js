import express from 'express';
import * as mockController from '../controllers/mock.controller.js';

const router = express.Router();

router.get('/jobs', mockController.handleGetJobs);
router.get('/candidates/:id', mockController.handleGetCandidateById);
router.post('/applications', mockController.handleApplyJob);

export default router;