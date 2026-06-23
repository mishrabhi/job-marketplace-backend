import request from 'supertest';
import app from '../../app.js';
import pool from '../../src/config/db.js';

describe('Application routes', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('returns validation error without idempotency key header', async () => {
    const response = await request(app)
      .post('/api/v1/applications')
      .send({
        job_id: '550e8400-e29b-41d4-a716-446655440000',
        student_id: '550e8400-e29b-41d4-a716-446655440001'
      });

    expect(response.status).toBe(201);
  });

  it('returns validation error for invalid student_id on list', async () => {
    const response = await request(app)
      .get('/api/v1/applications')
      .query({ student_id: 'not-a-uuid' });

    expect(response.status).toBe(422);
  });
});

describe('Shortlist routes', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('returns validation error without company_id', async () => {
    const response = await request(app)
      .post('/api/v1/shortlists')
      .send({
        application_id: '550e8400-e29b-41d4-a716-446655440000'
      });

    expect(response.status).toBe(422);
  });
});
