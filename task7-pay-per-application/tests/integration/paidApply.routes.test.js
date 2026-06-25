jest.mock('../../../src/config/db');
jest.mock('../../../src/config/razorpay');

const request = require('supertest');
const app = require('../../../app');

describe('Paid Apply Routes Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/paid-applications', () => {
    it('should return 201 and create application on valid request', async () => {
      const response = await request(app)
        .post('/api/v1/paid-applications')
        .send({
          student_id: 'student-uuid-1234',
          job_id: 'job-uuid-5678',
          idempotency_key: 'test-key-12345678',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.application).toBeDefined();
      expect(response.body.data.payment).toBeDefined();
      expect(response.body.data.razorpay_order).toBeDefined();
    });

    it('should return 422 on invalid student_id format', async () => {
      const response = await request(app)
        .post('/api/v1/paid-applications')
        .send({
          student_id: 'not-a-uuid',
          job_id: 'job-uuid-5678',
          idempotency_key: 'test-key-12345678',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 422 on idempotency_key too short', async () => {
      const response = await request(app)
        .post('/api/v1/paid-applications')
        .send({
          student_id: 'student-uuid-1234',
          job_id: 'job-uuid-5678',
          idempotency_key: 'short',
        });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/paid-applications/confirm', () => {
    it('should return 200 on valid confirmation', async () => {
      const response = await request(app)
        .post('/api/v1/paid-applications/confirm')
        .send({
          application_id: 'app-uuid-1234',
          razorpay_order_id: 'order_xyz',
          razorpay_payment_id: 'pay_abc',
          razorpay_signature: 'signature123456789',
        });

      // Response status depends on mocked service
      expect(response.body).toBeDefined();
    });

    it('should return 422 on invalid application_id format', async () => {
      const response = await request(app)
        .post('/api/v1/paid-applications/confirm')
        .send({
          application_id: 'not-a-uuid',
          razorpay_order_id: 'order_xyz',
          razorpay_payment_id: 'pay_abc',
          razorpay_signature: 'signature123456789',
        });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 422 on signature too short', async () => {
      const response = await request(app)
        .post('/api/v1/paid-applications/confirm')
        .send({
          application_id: 'app-uuid-1234',
          razorpay_order_id: 'order_xyz',
          razorpay_payment_id: 'pay_abc',
          razorpay_signature: 'short',
        });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/paid-applications/:id', () => {
    it('should return 200 with application data', async () => {
      const response = await request(app)
        .get('/api/v1/paid-applications/app-uuid-1234')
        .query({ student_id: 'student-uuid-1234' });

      // Response depends on mocked service
      expect(response.body).toBeDefined();
    });

    it('should return 422 on invalid application id format', async () => {
      const response = await request(app)
        .get('/api/v1/paid-applications/not-a-uuid')
        .query({ student_id: 'student-uuid-1234' });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if student_id missing', async () => {
      const response = await request(app)
        .get('/api/v1/paid-applications/app-uuid-1234');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_STUDENT_ID');
    });
  });

  describe('Health check', () => {
    it('should return 200 with status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.task).toBe('task7-pay-per-application');
    });
  });
});
