import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import app, { pool } from '../server.js';

describe('Full E2E Flow', () => {
  const companyId = uuidv4();
  const studentId = uuidv4();
  const skillId = uuidv4();
  let jobId, assessmentLink, applicationId, shortlistId;

  beforeAll(async () => {
    // Seed company
    await pool.query(
      `INSERT INTO companies (id, name, email, phone, kyc_status) VALUES ($1, $2, $3, $4, 'verified')`,
      [companyId, 'Test Company', 'test@company.com', '1234567890']
    );

    // Seed student with skill
    await pool.query(
      `INSERT INTO students (id, name, email, skill_scores) VALUES ($1, $2, $3, $4)`,
      [studentId, 'Test Student', 'student@test.com', JSON.stringify({ [skillId]: 75 })]
    );

    // Seed skill
    await pool.query(
      `INSERT INTO skills (id, name) VALUES ($1, $2)`,
      [skillId, 'Node.js']
    );
  });

  afterAll(async () => {
    await pool.end();
  });

  test('1. Company signs up and gets profile', async () => {
    const res = await request(app).post('/companies').send({
      name: 'Another Company',
      email: `company-${Date.now()}@test.com`,
      phone: '9876543210'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  test('2. Company submits KYC', async () => {
    const res = await request(app)
      .patch(`/companies/${companyId}/kyc`)
      .send({
        doc_type: 'GST',
        storage_url: 'https://storage.example.com/doc.pdf'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('3. Company posts job with thresholds', async () => {
    const res = await request(app).post('/jobs').send({
      company_id: companyId,
      title: 'Senior Node.js Developer',
      description: 'We need an experienced Node.js developer',
      thresholds: [
        {
          skill_id: skillId,
          min_level: 50
        }
      ]
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    jobId = res.body.data.id;
  });

  test('4. Company publishes job', async () => {
    const res = await request(app)
      .post(`/jobs/${jobId}/publish`)
      .send({
        company_id: companyId
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assessmentLink).toHaveProperty('token');
    assessmentLink = res.body.data.assessmentLink;
  });

  test('5. Student searches published jobs', async () => {
    const res = await request(app).get('/search/jobs?q=Node');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('6. System checks student skill threshold eligibility', async () => {
    const res = await request(app).post('/threshold/check').send({
      student_id: studentId,
      job_id: jobId
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eligible).toBe(true);
  });

  test('7. Student applies with idempotency', async () => {
    const idempotencyKey = uuidv4();
    const res1 = await request(app)
      .post('/applications')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        job_id: jobId,
        student_id: studentId
      });

    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);
    applicationId = res1.body.data.id;

    // Retry same request (idempotency test)
    const res2 = await request(app)
      .post('/applications')
      .set('Idempotency-Key', idempotencyKey)
      .send({
        job_id: jobId,
        student_id: studentId
      });

    expect(res2.status).toBe(201);
    expect(res2.body.data.id).toBe(applicationId);
  });

  test('8. Company shortlists candidate', async () => {
    const res = await request(app).post('/shortlists').send({
      application_id: applicationId,
      company_id: companyId,
      note: 'Great fit for the role'
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    shortlistId = res.body.data.id;
  });

  test('9. Health check succeeds', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.database).toBe('connected');
  });

  test('10. Readiness check succeeds', async () => {
    const res = await request(app).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ready');
  });
});
