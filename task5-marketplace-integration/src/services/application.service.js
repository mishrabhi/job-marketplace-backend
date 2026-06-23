import Application from '../models/Application.js';
import { query } from '../config/db.js';

export default class ApplicationService {
  static async applyToJob({ jobId, studentId, idempotencyKey }) {
    if (!idempotencyKey) {
      const error = new Error('Idempotency-Key header is required');
      error.status = 400;
      error.code = 'IDEMPOTENCY_KEY_REQUIRED';
      throw error;
    }

    const existingByKey = await Application.findByIdempotencyKey(idempotencyKey);
    if (existingByKey) {
      return existingByKey;
    }

    const jobResult = await query(`SELECT id, status FROM jobs WHERE id = $1`, [jobId]);
    if (jobResult.rows.length === 0) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    const job = jobResult.rows[0];
    if (job.status !== 'published') {
      const error = new Error('Job is not published');
      error.status = 400;
      error.code = 'JOB_NOT_PUBLISHED';
      throw error;
    }

    const studentResult = await query(`SELECT id FROM students WHERE id = $1`, [studentId]);
    if (studentResult.rows.length === 0) {
      const error = new Error('Student not found');
      error.status = 404;
      error.code = 'STUDENT_NOT_FOUND';
      throw error;
    }

    const existingApp = await Application.findByJobAndStudent(jobId, studentId);
    if (existingApp) {
      return existingApp;
    }

    const application = await Application.create({ jobId, studentId, idempotencyKey });
    return application;
  }

  static async getApplicationStatus(applicationId) {
    const application = await Application.findById(applicationId);
    if (!application) {
      const error = new Error('Application not found');
      error.status = 404;
      error.code = 'APPLICATION_NOT_FOUND';
      throw error;
    }
    return application;
  }
}
