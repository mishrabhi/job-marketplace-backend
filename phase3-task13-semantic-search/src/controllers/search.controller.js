import * as searchService from '../services/search.service.js';
import { executeSearchSchema, indexCandidateSchema } from '../validators/search.validator.js';

export const handleHybridSearch = async (req, res, next) => {
  try {
    const validatedBody = executeSearchSchema.parse(req.body);
    const result = await searchService.executeHybridSearch(validatedBody);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const handleIndexCandidate = async (req, res, next) => {
  try {
    const validatedBody = indexCandidateSchema.parse(req.body);
    const indexed = await searchService.indexCandidateForSearch(validatedBody);
    return res.status(201).json({ success: true, data: indexed });
  } catch (err) {
    next(err);
  }
};