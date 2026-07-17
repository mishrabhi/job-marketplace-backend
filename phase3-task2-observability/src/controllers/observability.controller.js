import * as obsService from '../services/observability.service.js';
import { registerTraceSpanSchema, getBudgetSummarySchema } from '../validators/observability.validator.js';

export const ingestTraceSpan = async (req, res, next) => {
  try {
    const validatedBody = registerTraceSpanSchema.parse(req.body);
    const resultReceipt = await obsService.processIncomingTelemetrySpan(validatedBody);
    return res.status(201).json({ success: true, data: resultReceipt });
  } catch (err) {
    next(err);
  }
};

export const fetchBudgetSummaryReport = async (req, res, next) => {
  try {
    const validatedQueries = getBudgetSummarySchema.parse(req.query);
    const dashboardReport = await obsService.calculateErrorBudgetDashboard(validatedQueries.endpoint_path);
    return res.status(200).json({ success: true, data: dashboardReport });
  } catch (err) {
    next(err);
  }
};