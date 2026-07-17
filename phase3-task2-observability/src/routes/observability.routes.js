import express from 'express';
const router = express.Router();
import * as obsController from '../controllers/observability.controller.js';
import { traceContextInjector } from '../middlewares/traceContext.js';

// OpenTelemetry trace logging ingestion target path
router.post('/telemetry/spans', traceContextInjector, obsController.ingestTraceSpan);

// Observability budget dashboard query data summary path
router.get('/budget/dashboard', obsController.fetchBudgetSummaryReport);

export default router;