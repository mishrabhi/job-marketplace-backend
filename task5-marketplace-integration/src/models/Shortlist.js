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

  static async findByApplicationId(applicationId) {
    const result = await query(
      `SELECT ${SHORTLIST_SELECT} FROM shortlists WHERE application_id = $1`,
      [applicationId]
    );
    return result.rows[0] || null;
  }
}
