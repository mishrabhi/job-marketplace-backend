import { query } from '../config/db.js';

const APP_COLUMNS = ['id', 'job_id', 'student_id', 'status', 'idempotency_key', 'created_at'];
const APP_SELECT = APP_COLUMNS.join(', ');

export default class Application {
  static async create({ jobId, studentId, idempotencyKey }) {
    const result = await query(
      `INSERT INTO applications (job_id, student_id, status, idempotency_key) VALUES ($1, $2, 'applied', $3) RETURNING ${APP_SELECT}`,
      [jobId, studentId, idempotencyKey]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(`SELECT ${APP_SELECT} FROM applications WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async findByIdempotencyKey(key) {
    const result = await query(
      `SELECT ${APP_SELECT} FROM applications WHERE idempotency_key = $1`,
      [key]
    );
    return result.rows[0] || null;
  }

  static async findByJobAndStudent(jobId, studentId) {
    const result = await query(
      `SELECT ${APP_SELECT} FROM applications WHERE job_id = $1 AND student_id = $2`,
      [jobId, studentId]
    );
    return result.rows[0] || null;
  }

  static async findByStudent(studentId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT ${APP_SELECT} FROM applications WHERE student_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [studentId, limit, offset]
    );
    return result.rows;
  }

  static async withdraw(id) {
    const result = await query(
      `UPDATE applications SET status = 'withdrawn' WHERE id = $1 RETURNING ${APP_SELECT}`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByJobId(jobId, limit = 50, offset = 0) {
    const result = await query(
      `SELECT ${APP_SELECT} FROM applications WHERE job_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [jobId, limit, offset]
    );
    return result.rows;
  }
}
