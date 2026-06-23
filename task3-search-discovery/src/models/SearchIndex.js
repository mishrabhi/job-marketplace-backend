import { query } from '../config/db.js';

const SEARCH_INDEX_COLUMNS = ['id', 'job_id', 'title', 'description', 'company_id', 'status', 'created_at'];
const SEARCH_INDEX_SELECT = SEARCH_INDEX_COLUMNS.join(', ');

export default class SearchIndex {
  static async findById(id) {
    const result = await query(
      `SELECT ${SEARCH_INDEX_SELECT} FROM search_index WHERE job_id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async listAll(limit = 50, offset = 0) {
    const result = await query(
      `SELECT ${SEARCH_INDEX_SELECT} FROM search_index WHERE status = 'published' ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  static async countAll() {
    const result = await query(`SELECT COUNT(*) as count FROM search_index WHERE status = 'published'`);
    return parseInt(result.rows[0].count, 10);
  }
}
