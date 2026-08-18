import { repository } from '../data/repository.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

export const listJobs = async (filters, pagination) => {
  logger.info('Listing jobs with pagination parameters', { filters, pagination });
  return await repository.findMany('jobs', filters, pagination);
};

export const getJobById = async (jobId) => {
  const job = await repository.findById('jobs', jobId);
  if (!job) {
    throw appError(404, 'RESOURCE_NOT_FOUND', `Job posting with ID '${jobId}' was not found.`);
  }
  return job;
};

export const createNewJob = async (jobData) => {
  logger.info(`Creating new job posting: ${jobData.title}`);
  return await repository.create('jobs', {
    ...jobData,
    status: 'OPEN'
  });
};