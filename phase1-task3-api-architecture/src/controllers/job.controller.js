import * as jobService from '../services/job.service.js';
import { createJobSchema } from '../validators/job.validator.js';
import { successResponse, paginatedResponse } from '../utils/responseEnvelope.js';

export const handleGetJobs = async (req, res, next) => {
  try {
    const filters = { status: req.query.status };
    const { items, totalRecords } = await jobService.listJobs(filters, req.pagination);
    
    return res.status(200).json(paginatedResponse(items, {
      page: req.pagination.page,
      limit: req.pagination.limit,
      totalRecords
    }));
  } catch (err) {
    next(err);
  }
};

export const handleGetJobById = async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    return res.status(200).json(successResponse(job));
  } catch (err) {
    next(err);
  }
};

export const handleCreateJob = async (req, res, next) => {
  try {
    const validatedBody = createJobSchema.parse(req.body);
    const newJob = await jobService.createNewJob(validatedBody);
    return res.status(201).json(successResponse(newJob));
  } catch (err) {
    next(err);
  }
};