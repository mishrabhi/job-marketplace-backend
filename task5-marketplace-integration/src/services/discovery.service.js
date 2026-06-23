import { query } from '../config/db.js';

export default class DiscoveryService {
  static async getRankedFeed(studentId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const studentResult = await query(
      `SELECT skill_scores FROM students WHERE id = $1`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      const error = new Error('Student not found');
      error.status = 404;
      error.code = 'STUDENT_NOT_FOUND';
      throw error;
    }

    const skillScores = studentResult.rows[0].skill_scores || {};

    const jobsResult = await query(
      `SELECT 
        j.id, j.company_id, j.title, j.description, j.status, j.created_at,
        COALESCE(json_agg(json_build_object('skill_id', st.skill_id, 'min_level', st.min_level)) 
          FILTER (WHERE st.id IS NOT NULL), '[]'::json) as thresholds
       FROM jobs j
       LEFT JOIN skill_thresholds st ON j.id = st.job_id
       WHERE j.status = 'published'
       GROUP BY j.id
       ORDER BY j.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const rankedJobs = jobsResult.rows.map((job) => {
      let matchScore = 0;
      let totalThresholds = job.thresholds.length;

      if (totalThresholds > 0) {
        let metThresholds = 0;
        for (const threshold of job.thresholds) {
          const studentScore = skillScores[threshold.skill_id] || 0;
          if (studentScore >= threshold.min_level) {
            metThresholds += 1;
          }
        }
        matchScore = (metThresholds / totalThresholds) * 100;
      } else {
        matchScore = 100;
      }

      return {
        ...job,
        match_score: matchScore
      };
    }).sort((a, b) => b.match_score - a.match_score);

    const totalResult = await query(
      `SELECT COUNT(*) as count FROM jobs WHERE status = 'published'`
    );
    const total = parseInt(totalResult.rows[0].count, 10);

    return {
      data: rankedJobs,
      meta: { page, limit, total }
    };
  }

  static async getJobDetail(jobId) {
    const result = await query(
      `SELECT 
        j.id, j.company_id, j.title, j.description, j.status, j.created_at,
        COALESCE(json_agg(json_build_object('id', st.id, 'skill_id', st.skill_id, 'min_level', st.min_level)) 
          FILTER (WHERE st.id IS NOT NULL), '[]'::json) as thresholds
       FROM jobs j
       LEFT JOIN skill_thresholds st ON j.id = st.job_id
       WHERE j.id = $1 AND j.status = 'published'
       GROUP BY j.id`,
      [jobId]
    );

    if (result.rows.length === 0) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    return result.rows[0];
  }
}
