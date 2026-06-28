import revenueService from ('../services/revenue.service');
import { revenueDashboardQuerySchema, reconciliationQuerySchema } from ('../validators/revenue.validator');

export default getDashboardSummary = async (req, res, next) => {
  try {
    const filters = revenueDashboardQuerySchema.parse(req.query);
    const metricsData = await revenueService.getRevenueDashboardMetrics(filters);
    
    return res.status(200).json({
      success: true,
      data: metricsData
    });
  } catch (err) {
    next(err);
  }
};

export default triggerDailyReconciliation = async (req, res, next) => {
  try {
    const parsedQuery = reconciliationQuerySchema.parse(req.query);
    const reconciliationReport = await revenueService.performGatewayReconciliation(parsedQuery.date);
    
    return res.status(200).json({
      success: true,
      data: reconciliationReport
    });
  } catch (err) {
    next(err);
  }
};
