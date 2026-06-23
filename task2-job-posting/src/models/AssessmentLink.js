import { query } from '../config/db.js';

const LINK_COLUMNS = ['id', 'job_id', 'token', 'expires_at', 'created_at'];
const LINK_SELECT = LINK_COLUMNS.join(', ');

export default class AssessmentLink {
  static async create({ jobId, token, expiresAt }) {
    const result = await query(
      `INSERT INTO assessment_links (job_id, token, expires_at) VALUES ($1, $2, $3) RETURNING ${LINK_SELECT}`,
      [jobId, token, expiresAt]
    );
    return result.rows[0];
  }

  static async findByJobId(jobId) {
    const result = await query(
      `SELECT ${LINK_SELECT} FROM assessment_links WHERE job_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [jobId]
    );
    return result.rows[0] || null;
  }

  static async findByToken(token) {
    const result = await query(
      `SELECT ${LINK_SELECT} FROM assessment_links WHERE token = $1`,
      [token]
    );
    return result.rows[0] || null;
  }
}
