import Shortlist from '../models/Shortlist.js';
import Application from '../models/Application.js';
import { query } from '../config/db.js';

export default class ShortlistService {
  static async shortlistCandidate({ applicationId, companyId, note = null }) {
    const application = await Application.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.status = 404;
      error.code = 'APPLICATION_NOT_FOUND';
      throw error;
    }

    const jobResult = await query(
      `SELECT company_id FROM jobs WHERE id = $1`,
      [application.job_id]
    );

    if (jobResult.rows.length === 0) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    const job = jobResult.rows[0];
    if (job.company_id !== companyId) {
      const error = new Error('Unauthorized: company does not own this job');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const existingShortlist = await Shortlist.findByApplicationId(applicationId);
    if (existingShortlist) {
      return existingShortlist;
    }

    const shortlist = await Shortlist.create({
      applicationId,
      companyId,
      status: 'shortlisted',
      note
    });

    return shortlist;
  }

  static async rejectCandidate({ applicationId, companyId, note = null }) {
    const application = await Application.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.status = 404;
      error.code = 'APPLICATION_NOT_FOUND';
      throw error;
    }

    const jobResult = await query(
      `SELECT company_id FROM jobs WHERE id = $1`,
      [application.job_id]
    );

    if (jobResult.rows.length === 0) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    const job = jobResult.rows[0];
    if (job.company_id !== companyId) {
      const error = new Error('Unauthorized: company does not own this job');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const shortlist = await Shortlist.create({
      applicationId,
      companyId,
      status: 'rejected',
      note
    });

    return shortlist;
  }

  static async getShortlistStatus(shortlistId) {
    const shortlist = await Shortlist.findById(shortlistId);
    if (!shortlist) {
      const error = new Error('Shortlist entry not found');
      error.status = 404;
      error.code = 'SHORTLIST_NOT_FOUND';
      throw error;
    }
    return shortlist;
  }

  static async updateShortlistStatus(shortlistId, status, note = null) {
    const shortlist = await Shortlist.findById(shortlistId);
    if (!shortlist) {
      const error = new Error('Shortlist entry not found');
      error.status = 404;
      error.code = 'SHORTLIST_NOT_FOUND';
      throw error;
    }

    if (!['shortlisted', 'rejected'].includes(status)) {
      const error = new Error(`Invalid status: ${status}`);
      error.status = 400;
      error.code = 'INVALID_STATUS';
      throw error;
    }

    const updated = await Shortlist.updateStatus(shortlistId, status, note);
    return updated;
  }

  static async listCandidatesForJob(jobId, companyId, limit = 50, offset = 0) {
    const jobResult = await query(
      `SELECT company_id FROM jobs WHERE id = $1`,
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    const job = jobResult.rows[0];
    if (job.company_id !== companyId) {
      const error = new Error('Unauthorized: company does not own this job');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const candidates = await Shortlist.findByJobAndCompany(jobId, companyId, limit, offset);
    return candidates;
  }
}
