import * as candidateService from '../services/candidate.service.js';

export const handleGetLeaderboard = async (req, res, next) => {
  try {
    const gradYear = parseInt(req.query.grad_year, 10) || 2026;
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);

    const candidates = await candidateService.getLeaderboard(gradYear, limit);
    return res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (err) {
    next(err);
  }
};

export const handleExplainQuery = async (req, res, next) => {
  try {
    const gradYear = parseInt(req.query.grad_year, 10) || 2026;
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);

    const plan = await candidateService.runExplainAnalysis(gradYear, limit);
    return res.status(200).json({
      success: true,
      execution_plan: plan
    });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateGpa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { gpa } = req.body;

    const updated = await candidateService.updateGpaAndInvalidate(id, parseFloat(gpa));
    return res.status(200).json({
      success: true,
      message: 'Student GPA updated and related cache invalidated',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};