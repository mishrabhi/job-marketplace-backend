import * as dashboardService from '../services/dashboard.service.js';
import { collegeDashboardSchema } from '../validators/dashboard.validator.js';

export const getCollegeDashboardMetrics = async (req, res, next) => {
  try {
    const validatedQueries = collegeDashboardSchema.parse(req.query);
    const analyticalSummary = await dashboardService.fetchExtendedPlacementAnalytics(
      validatedQueries.college_id,
      validatedQueries.requesting_user_id
    );
    return res.status(200).json({ success: true, data: analyticalSummary });
  } catch (err) {
    next(err);
  }
};