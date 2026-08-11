import { mockJobs, mockCandidates } from '../data/mockData.js';
import { env } from '../config/env.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

export const fetchJobsList = async () => {
  if (env.USE_MOCK_DATA) {
    logger.info('Serving jobs list from Mock Data Provider');
    return mockJobs;
  }
  
  // Real database logic target path
  throw appError(501, 'NOT_IMPLEMENTED', 'Real database integration is not enabled yet.');
};

export const fetchCandidateById = async (candidateId) => {
  if (env.USE_MOCK_DATA) {
    logger.info(`Serving candidate profile ${candidateId} from Mock Data Provider`);
    const candidate = mockCandidates[candidateId];
    if (!candidate) {
      throw appError(404, 'CANDIDATE_NOT_FOUND', `Candidate with ID '${candidateId}' not found.`);
    }
    return candidate;
  }

  // Real database logic target path
  throw appError(501, 'NOT_IMPLEMENTED', 'Real database integration is not enabled yet.');
};

export const submitApplication = async (payload) => {
  const { job_id, candidate_id, cover_note } = payload;

  if (env.USE_MOCK_DATA) {
    logger.info(`Processing mock job application for candidate ${candidate_id} to job ${job_id}`);
    
    return {
      application_id: `app_${Date.now()}`,
      job_id,
      candidate_id,
      cover_note: cover_note || null,
      status: 'SUBMITTED',
      submitted_at: new Date().toISOString()
    };
  }

  // Real database logic target path
  throw appError(501, 'NOT_IMPLEMENTED', 'Real database integration is not enabled yet.');
};