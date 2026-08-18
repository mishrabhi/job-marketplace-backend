import express from 'express';
import * as jobController from '../controllers/job.controller.js';
import { parsePaginationQuery } from '../middlewares/queryParser.js';

const router = express.Router();

router.get('/', parsePaginationQuery, jobController.handleGetJobs);
router.get('/:id', jobController.handleGetJobById);
router.post('/', jobController.handleCreateJob);

export default router;