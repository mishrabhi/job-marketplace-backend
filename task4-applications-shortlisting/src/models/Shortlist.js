import { query } from '../config/db.js';

const SHORTLIST_COLUMNS = ['id', 'application_id', 'company_id', 'status', 'note', 'created_at', 'updated_at'];
const SHORTLIST_SELECT = SHORTLIST_COLUMNS.join(', ');

export default class Shortlist {
  static async create({ applicationId, companyId, status = 'shortlisted', note = null }) {
    const result = await query(
      `INSERT INTO shortlists (application_id, company_id, status, note) VALUES ($1, $2, $3, $4) RETURNING ${SHORTLIST_SELECT}`,
      [applicationId, companyId, status, note]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(`SELECT ${SHORTLIST_SELECT} FROM shortlists WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async findByApplicationId(applicationId) {
    const result = await query(
      `SELECT ${SHORTLIST_SELECT} FROM shortlists WHERE application_id = $1`,
      [applicationId]
    );
    return result.rows[0] || null;
  }

  static async findByJobAndCompany(jobId, companyId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT s.${SHORTLIST_SELECT} FROM shortlists s
       JOIN applications a ON s.application_id = a.id
       WHERE a.job_id = $1 AND s.company_id = $2
       ORDER BY s.created_at DESC LIMIT $3 OFFSET $4`,
      [jobId, companyId, limit, offset]
    );
    return result.rows;
  }

  static async updateStatus(id, status, note = null) {
    const result = await query(
      `UPDATE shortlists SET status = $1, note = $2, updated_at = now() WHERE id = $3 RETURNING ${SHORTLIST_SELECT}`,
      [status, note, id]
    );
    return result.rows[0] || null;
  }
}
