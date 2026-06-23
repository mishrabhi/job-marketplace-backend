import pool from '../config/db.js';

export default class IntegrationService {
  static async getHealth() {
    try {
      const result = await pool.query('SELECT 1');
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message
      };
    }
  }

  static async getReadiness() {
    try {
      const tables = [
        'companies',
        'students',
        'jobs',
        'applications',
        'shortlists',
        'skill_thresholds',
        'kyc_docs'
      ];

      for (const table of tables) {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1`);
      }

      return {
        status: 'ready',
        services: {
          database: 'ok',
          tables: 'ok'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'not_ready',
        error: error.message
      };
    }
  }
}
