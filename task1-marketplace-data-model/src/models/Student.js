import { query } from '../config/db.js';

const STUDENT_COLUMNS = ['id', 'name', 'email', 'skill_scores', 'created_at'];
const STUDENT_SELECT = STUDENT_COLUMNS.join(', ');

export default class Student {
  static async findById(id) {
    const result = await query(`SELECT ${STUDENT_SELECT} FROM students WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }
}
