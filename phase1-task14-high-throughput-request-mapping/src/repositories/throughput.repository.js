import { query } from '../config/db.js';

export const throughputRepository = {
  getBatchFeedOptimized: async (limit = 50) => {
    // Lean projection returning indexed columns without expensive full-table scans[cite: 15]
    const sql = `
      SELECT id, title, salary_lpa, status, created_at
      FROM jobs
      ORDER BY created_at DESC
      LIMIT $1;
    `;
    const result = await query(sql, [limit]);
    return result.rows;
  }
};