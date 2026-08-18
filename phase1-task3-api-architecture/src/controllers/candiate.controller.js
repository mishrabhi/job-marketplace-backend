import * as candidateService from '../services/candidate.service.js';
import { createCandidateSchema } from '../validators/candidate.validator.js';
import { successResponse, paginatedResponse } from '../utils/responseEnvelope.js';

export const handleGetCandidates = async (req, res, next) => {
  try {
    const filters = { skills: req.query.skill };
    const { items, totalRecords } = await candidateService.listCandidates(filters, req.pagination);

    return res.status(200).json(paginatedResponse(items, {
      page: req.pagination.page,
      limit: req.pagination.limit,
      totalRecords
    }));
  } catch (err) {
    next(err);
  }
};

export const handleGetCandidateById = async (req, res, next) => {
  try {
    const candidate = await candidateService.getCandidateById(req.params.id);
    return res.status(200).json(successResponse(candidate));
  } catch (err) {
    next(err);
  }
};

export const handleRegisterCandidate = async (req, res, next) => {
  try {
    const validatedBody = createCandidateSchema.parse(req.body);
    const newCandidate = await candidateService.registerCandidate(validatedBody);
    return res.status(201).json(successResponse(newCandidate));
  } catch (err) {
    next(err);
  }
};