import { relationshipRepository } from '../repositories/relationship.repository.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

export const listCompaniesAndJobsTree = async () => {
  logger.info('Fetching companies and nested job hierarchies in single query (Anti-N+1)');
  return await relationshipRepository.getCompaniesWithNestedJobs();
};

export const getJobApplicantsTree = async (jobId) => {
  logger.info(`Fetching job applicants tree for job ID: ${jobId}`);
  const job = await relationshipRepository.getJobWithApplicants(jobId);
  if (!job) {
    throw appError(404, 'JOB_NOT_FOUND', `Job posting '${jobId}' not found.`);
  }
  return job;
};

export const removeJobAndVerifyCascade = async (jobId) => {
  logger.warn(`Triggering CASCADE delete for Job ID: ${jobId}`);
  const deleted = await relationshipRepository.deleteJobCascade(jobId);
  if (!deleted) {
    throw appError(404, 'JOB_NOT_FOUND', `Job posting '${jobId}' does not exist.`);
  }
  return { deleted: true, job_id: jobId, rule_applied: 'CASCADE_APPLICATIONS_DELETED' };
};

export const removeCompanyAndVerifyRestrict = async (companyId) => {
  logger.warn(`Attempting RESTRICT delete for Company ID: ${companyId}`);
  // If dependent jobs exist, Postgres will throw code 23503 caught by errorHandler[cite: 13]
  const deleted = await relationshipRepository.deleteCompanyRestrict(companyId);
  if (!deleted) {
    throw appError(404, 'COMPANY_NOT_FOUND', `Company '${companyId}' does not exist.`);
  }
  return { deleted: true, company_id: companyId };
};