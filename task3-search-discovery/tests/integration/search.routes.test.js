import request from 'supertest';
import app from '../../app.js';
import pool from '../../src/config/db.js';

describe('Search routes', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('searches jobs by query', async () => {
    const response = await request(app)
      .get('/api/v1/search/jobs')
      .query({ q: 'Backend', page: 1, limit: 20 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.meta).toBeDefined();
  });

  it('returns validation error for invalid page', async () => {
    const response = await request(app)
      .get('/api/v1/search/jobs')
      .query({ page: 0 });

    expect(response.status).toBe(422);
  });
});

describe('Discovery routes', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('returns feed validation error without student_id', async () => {
    const response = await request(app)
      .get('/api/v1/discovery/feed')
      .query({ page: 1 });

    expect(response.status).toBe(422);
  });
});
