import express from 'express';
const router = express.Router();
import * as profilingController from '../controllers/profiling.controller.js';

// Query trace log profiles endpoint target
router.post('/profiles/log', profilingController.addProfilingMetric);

// Performance latency benchmark tracking endpoint target
router.post('/benchmarks/commit', profilingController.saveLatencyBenchmark);

export default router;