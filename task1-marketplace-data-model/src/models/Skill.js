import { query } from '../config/db.js';

const SKILL_COLUMNS = ['id', 'name', 'category', 'max_level', 'created_at'];
const SKILL_SELECT = SKILL_COLUMNS.join(', ');

export default class Skill {
  static async listAll() {
    const result = await query(`SELECT ${SKILL_SELECT} FROM skills ORDER BY name ASC`);
    return result.rows;
  }

  static async findById(id) {
    const result = await query(`SELECT ${SKILL_SELECT} FROM skills WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }
}
