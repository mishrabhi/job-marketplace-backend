import { repository } from '../data/repository.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

export const listCandidates = async (filters, pagination) => {
  logger.info('Listing candidates with pagination parameters', { filters, pagination });
  return await repository.findMany('candidates', filters, pagination);
};

export const getCandidateById = async (candidateId) => {
  const candidate = await repository.findById('candidates', candidateId);
  if (!candidate) {
    throw appError(404, 'RESOURCE_NOT_FOUND', `Candidate profile with ID '${candidateId}' was not found.`);
  }
  return candidate;
};

export const registerCandidate = async (candidateData) => {
  logger.info(`Registering candidate: ${candidateData.full_name}`);
  return await repository.create('candidates', candidateData);
};