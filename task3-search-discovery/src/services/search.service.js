import { query } from '../config/db.js';

export default class SearchService {
  static async searchJobs({ q, skill_id, min_level, page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    let sql = `SELECT j.id, j.company_id, j.title, j.description, j.status, j.created_at 
               FROM jobs j 
               WHERE j.status = 'published'`;
    const params = [];

    if (q) {
      params.push(q);
      sql += ` AND (j.title ILIKE $${params.length} OR j.description ILIKE $${params.length})`;
    }

    if (skill_id) {
      params.push(skill_id);
      sql += ` AND EXISTS (
        SELECT 1 FROM skill_thresholds st 
        WHERE st.job_id = j.id AND st.skill_id = $${params.length}`;

      if (min_level) {
        params.push(min_level);
        sql += ` AND st.min_level <= $${params.length}`;
      }

      sql += `)`;
    }

    sql += ` ORDER BY j.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = `SELECT COUNT(*) as count FROM jobs j WHERE j.status = 'published'`;
    const countParams = [];

    if (q) {
      countParams.push(q);
      countSql += ` AND (j.title ILIKE $${countParams.length} OR j.description ILIKE $${countParams.length})`;
    }

    if (skill_id) {
      countParams.push(skill_id);
      countSql += ` AND EXISTS (
        SELECT 1 FROM skill_thresholds st 
        WHERE st.job_id = j.id AND st.skill_id = $${countParams.length}`;

      if (min_level) {
        countParams.push(min_level);
        countSql += ` AND st.min_level <= $${countParams.length}`;
      }

      countSql += `)`;
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: result.rows,
      meta: { page, limit, total }
    };
  }
}
