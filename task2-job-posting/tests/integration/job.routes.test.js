import request from 'supertest';
import app from '../../app.js';
import pool from '../../src/config/db.js';

const createdJobs = [];

describe('Job routes', () => {
  beforeAll(async () => {
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    await pool.query('ROLLBACK');
    await pool.end();
  });

  it('creates a job and returns 201', async () => {
    const response = await request(app)
      .post('/api/v1/jobs')
      .send({
        company_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Backend Engineer',
        description: 'Build APIs',
        thresholds: [{ skill_id: '550e8400-e29b-41d4-a716-446655440001', min_level: 60 }]
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Backend Engineer');
  });

  it('returns validation error when no thresholds', async () => {
    const response = await request(app)
      .post('/api/v1/jobs')
      .send({
        company_id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Role',
        description: 'Desc',
        thresholds: []
      });

    expect(response.status).toBe(422);
  });
});
