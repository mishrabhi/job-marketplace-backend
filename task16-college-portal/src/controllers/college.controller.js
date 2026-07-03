import * as collegeService from '../services/college.service.js';
import { collegeReportQuerySchema, provisionAdminSchema } from '../validators/college.validator.js';

export const fetchCollegePortalAnalytics = async (req, res, next) => {
  try {
    const queryFilters = collegeReportQuerySchema.parse(req.query);
    const analyticalReport = await collegeService.compileCollegeMetricsReport(
      queryFilters.college_id,
      queryFilters.requesting_user_id
    );
    return res.status(200).json({ success: true, data: analyticalReport });
  } catch (err) {
    next(err);
  }
};

export const provisionCollegeOfficer = async (req, res, next) => {
  try {
    const validatedBody = provisionAdminSchema.parse(req.body);
    const executionDetails = await collegeService.registerNewCollegeAdmin(validatedBody);
    return res.status(201).json({ success: true, data: executionDetails });
  } catch (err) {
    next(err);
  }
};