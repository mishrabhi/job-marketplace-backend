import { query } from '../config/db.js';

const JOB_COLUMNS = ['id', 'company_id', 'title', 'description', 'status', 'created_at'];
const JOB_SELECT = JOB_COLUMNS.join(', ');

export default class Job {
  static async create({ companyId, title, description }) {
    const result = await query(
      `INSERT INTO jobs (company_id, title, description, status) VALUES ($1, $2, $3, 'draft') RETURNING ${JOB_SELECT}`,
      [companyId, title, description]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(`SELECT ${JOB_SELECT} FROM jobs WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async findByIdWithThresholds(id) {
    const jobResult = await query(`SELECT ${JOB_SELECT} FROM jobs WHERE id = $1`, [id]);
    const job = jobResult.rows[0];
    if (!job) return null;

    const thresholdResult = await query(
      `SELECT id, skill_id, min_level FROM skill_thresholds WHERE job_id = $1`,
      [id]
    );
    return { ...job, thresholds: thresholdResult.rows };
  }

  static async updateStatus(id, status) {
    const result = await query(
      `UPDATE jobs SET status = $1 WHERE id = $2 RETURNING ${JOB_SELECT}`,
      [status, id]
    );
    return result.rows[0];
  }
}
