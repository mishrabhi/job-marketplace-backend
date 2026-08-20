import { candidateRepository } from '../repositories/candidate.repository.js';
import { cache } from '../config/cache.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

export const getLeaderboard = async (gradYear, limit) => {
  logger.info(`Fetching top candidates leaderboard for grad year ${gradYear} with limit ${limit}`);
  return await candidateRepository.getTopCandidatesOptimized(gradYear, limit);
};

export const runExplainAnalysis = async (gradYear, limit) => {
  logger.info(`Running EXPLAIN ANALYZE on leaderboard query`);
  return await candidateRepository.explainLeaderboardQuery(gradYear, limit);
};

export const updateGpaAndInvalidate = async (studentId, newGpa) => {
  logger.info(`Updating GPA for student ${studentId} to ${newGpa}`);
  const updatedStudent = await candidateRepository.updateStudentGpa(studentId, newGpa);

  if (!updatedStudent) {
    throw appError(404, 'STUDENT_NOT_FOUND', `Student with ID '${studentId}' not found.`);
  }

  // Invalidate any cached leaderboard endpoints[cite: 14]
  cache.invalidatePattern('cache:/api/v1/candidates/leaderboard');

  return updatedStudent;
};