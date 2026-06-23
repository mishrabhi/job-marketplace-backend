import pkg from 'pg';
import env from './env.js';

const { Pool } = pkg;

const pool = new Pool({ connectionString: env.DATABASE_URL });

export async function query(text, params) {
  const result = await pool.query(text, params);
  return result;
}

export default pool;
