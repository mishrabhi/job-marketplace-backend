import express from 'express';
import * as dataController from '../controllers/data.controller.js';

const router = express.Router();

router.post('/students', dataController.handleRegisterStudent);
router.post('/applications', dataController.handleApplyJob);

export default router;