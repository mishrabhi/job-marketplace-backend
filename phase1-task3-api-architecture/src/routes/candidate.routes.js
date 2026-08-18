import express from 'express';
import * as candidateController from '../controllers/candidate.controller.js';
import { parsePaginationQuery } from '../middlewares/queryParser.js';

const router = express.Router();

router.get('/', parsePaginationQuery, candidateController.handleGetCandidates);
router.get('/:id', candidateController.handleGetCandidateById);
router.post('/', candidateController.handleRegisterCandidate);

export default router;