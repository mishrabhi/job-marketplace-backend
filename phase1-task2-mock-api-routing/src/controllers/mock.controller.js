import * as mockService from '../services/mock.service.js';
import { createApplicationSchema } from '../validators/mock.validator.js';

export const handleGetJobs = async (req, res, next) => {
  try {
    const jobs = await mockService.fetchJobsList();
    return res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (err) {
    next(err);
  }
};

export const handleGetCandidateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await mockService.fetchCandidateById(id);
    return res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (err) {
    next(err);
  }
};

export const handleApplyJob = async (req, res, next) => {
  try {
    const validatedBody = createApplicationSchema.parse(req.body);
    const application = await mockService.submitApplication(validatedBody);
    return res.status(201).json({
      success: true,
      data: application
    });
  } catch (err) {
    next(err);
  }
};