import { query } from '../config/db.js';

const THRESHOLD_COLUMNS = ['id', 'job_id', 'skill_id', 'min_level', 'created_at'];
const THRESHOLD_SELECT = THRESHOLD_COLUMNS.join(', ');

export default class SkillThreshold {
  static async create({ jobId, skillId, minLevel }) {
    const result = await query(
      `INSERT INTO skill_thresholds (job_id, skill_id, min_level) VALUES ($1, $2, $3) RETURNING ${THRESHOLD_SELECT}`,
      [jobId, skillId, minLevel]
    );
    return result.rows[0];
  }

  static async findByJobId(jobId) {
    const result = await query(
      `SELECT ${THRESHOLD_SELECT} FROM skill_thresholds WHERE job_id = $1`,
      [jobId]
    );
    return result.rows;
  }
}
