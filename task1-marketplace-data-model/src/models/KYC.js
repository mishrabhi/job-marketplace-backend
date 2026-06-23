import { query } from '../config/db.js';

const KYC_COLUMNS = ['id', 'company_id', 'doc_type', 'url', 'status', 'created_at', 'updated_at'];
const KYC_SELECT = KYC_COLUMNS.join(', ');

export default class KYC {
  static async upsert({ companyId, docType, url }) {
    const result = await query(
      `INSERT INTO kyc_docs (company_id, doc_type, url, status) VALUES ($1, $2, $3, 'submitted')
       ON CONFLICT (company_id) DO UPDATE SET doc_type = EXCLUDED.doc_type, url = EXCLUDED.url, status = 'submitted', updated_at = now()
       RETURNING ${KYC_SELECT}`,
      [companyId, docType, url]
    );
    return result.rows[0];
  }

  static async findByCompanyId(companyId) {
    const result = await query(`SELECT ${KYC_SELECT} FROM kyc_docs WHERE company_id = $1`, [companyId]);
    return result.rows[0] || null;
  }
}
