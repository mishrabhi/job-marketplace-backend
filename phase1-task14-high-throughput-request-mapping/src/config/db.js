import pg from 'pg';
import { env } from './env.js';
import { logger } from './logger.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
  statement_timeout: 2000 // Abort queries taking longer than 2 seconds to prevent queue clogging[cite: 15]
});

pool.on('error', (err) => {
  logger.error('Unexpected pool client error on idle pool', { error: err.message });
});

export const query = (text, params) => pool.query(text, params);