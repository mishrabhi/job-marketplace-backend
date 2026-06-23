import request from 'supertest';
import app from '../../app.js';
import pool from '../../src/config/db.js';

const createdCompanies = [];

describe('Company routes', () => {
  beforeAll(async () => {
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    await pool.query('ROLLBACK');
    await pool.end();
  });

  it('creates a company and returns 201', async () => {
    const response = await request(app)
      .post('/api/v1/companies')
      .send({ name: 'Acme', email: 'acme@example.com', phone: '+911234567890' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('acme@example.com');
    createdCompanies.push(response.body.data.id);
  });

  it('returns validation error for invalid payload', async () => {
    const response = await request(app).post('/api/v1/companies').send({ name: '' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
