import * as relationshipService from '../services/relationship.service.js';

export const handleGetCompaniesTree = async (req, res, next) => {
  try {
    const data = await relationshipService.listCompaniesAndJobsTree();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const handleGetJobApplicants = async (req, res, next) => {
  try {
    const data = await relationshipService.getJobApplicantsTree(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const handleDeleteJobCascade = async (req, res, next) => {
  try {
    const result = await relationshipService.removeJobAndVerifyCascade(req.params.id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleDeleteCompanyRestrict = async (req, res, next) => {
  try {
    const result = await relationshipService.removeCompanyAndVerifyRestrict(req.params.id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};