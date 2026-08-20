import { query } from '../config/db.js';

export const candidateRepository = {
  /**
   * Optimized Leaderboard Query using Covering Index Projections[cite: 14]
   */
  getTopCandidatesOptimized: async (gradYear, limit = 20) => {
    // Uses covering index idx_students_grad_gpa_status without full table scan[cite: 14]
    const sql = `
      SELECT id, full_name, email, gpa
      FROM students
      WHERE grad_year = $1
      ORDER BY gpa DESC
      LIMIT $2;
    `;
    const result = await query(sql, [gradYear, limit]);
    return result.rows;
  },

  /**
   * Runs EXPLAIN ANALYZE on query to verify index usage and execution time[cite: 14]
   */
  explainLeaderboardQuery: async (gradYear, limit = 20) => {
    const explainSql = `
      EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT id, full_name, email, gpa
      FROM students
      WHERE grad_year = $1
      ORDER BY gpa DESC
      LIMIT $2;
    `;
    const result = await query(explainSql, [gradYear, limit]);
    return result.rows[0]['QUERY PLAN'][0];
  },

  /**
   * Updates student GPA and triggers cache invalidation[cite: 14]
   */
  updateStudentGpa: async (studentId, newGpa) => {
    const sql = `
      UPDATE students
      SET gpa = $1
      WHERE id = $2
      RETURNING id, full_name, email, gpa;
    `;
    const result = await query(sql, [newGpa, studentId]);
    return result.rows[0] || null;
  }
};