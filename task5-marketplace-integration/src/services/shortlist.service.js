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
}
