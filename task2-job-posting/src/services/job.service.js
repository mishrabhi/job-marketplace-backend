import Job from '../models/Job.js';
import SkillThreshold from '../models/SkillThreshold.js';
import AssessmentLink from '../models/AssessmentLink.js';
import { v4 as uuidv4 } from 'uuid';

export default class JobService {
  static async createJob({ companyId, title, description, thresholds }) {
    if (!thresholds || thresholds.length === 0) {
      const error = new Error('At least one skill threshold is required');
      error.status = 400;
      error.code = 'THRESHOLDS_REQUIRED';
      throw error;
    }

    const job = await Job.create({ companyId, title, description });

    for (const { skill_id, min_level } of thresholds) {
      await SkillThreshold.create({ jobId: job.id, skillId: skill_id, minLevel: min_level });
    }

    const thresholdRows = await SkillThreshold.findByJobId(job.id);
    return { ...job, thresholds: thresholdRows };
  }

  static async getJob(jobId) {
    const job = await Job.findByIdWithThresholds(jobId);
    if (!job) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }
    return job;
  }

  static async publishJob(jobId, companyId) {
    const job = await Job.findById(jobId);
    if (!job) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    if (job.company_id !== companyId) {
      const error = new Error('Unauthorized: company does not own this job');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    if (job.status === 'published') {
      const existingLink = await AssessmentLink.findByJobId(jobId);
      if (existingLink) {
        return { job, assessmentLink: existingLink };
      }
    }

    const updatedJob = await Job.updateStatus(jobId, 'published');

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    const link = await AssessmentLink.create({ jobId, token, expiresAt });

    return { job: updatedJob, assessmentLink: link };
  }

  static async getAssessmentLink(jobId) {
    const job = await Job.findById(jobId);
    if (!job) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    const link = await AssessmentLink.findByJobId(jobId);
    if (!link) {
      const error = new Error('Assessment link not found');
      error.status = 404;
      error.code = 'ASSESSMENT_LINK_NOT_FOUND';
      throw error;
    }

    return link;
  }
}
