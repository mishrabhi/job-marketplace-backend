import { query } from '../config/db.js';

const COMPANY_COLUMNS = ['id', 'name', 'email', 'phone', 'kyc_status', 'created_at'];
const COMPANY_SELECT = COMPANY_COLUMNS.join(', ');

export default class Company {
  static async create({ name, email, phone }) {
    const result = await query(
      `INSERT INTO companies (name, email, phone, kyc_status) VALUES ($1, $2, $3, 'pending') RETURNING ${COMPANY_SELECT}`,
      [name, email, phone]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(`SELECT ${COMPANY_SELECT} FROM companies WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email) {
    const result = await query(`SELECT ${COMPANY_SELECT} FROM companies WHERE email = $1`, [email]);
    return result.rows[0] || null;
  }

  static async updateKycStatus(id, status) {
    const result = await query(
      `UPDATE companies SET kyc_status = $1 WHERE id = $2 RETURNING ${COMPANY_SELECT}`,
      [status, id]
    );
    return result.rows[0];
  }
}
