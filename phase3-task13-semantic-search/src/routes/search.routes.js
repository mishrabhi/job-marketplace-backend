import express from 'express';
const router = express.Router();
import * as searchController from '../controllers/search.controller.js';

// Hybrid search endpoint[cite: 19]
router.post('/query', searchController.handleHybridSearch);

// Candidate indexing endpoint[cite: 19]
router.post('/index', searchController.handleIndexCandidate);

export default router;