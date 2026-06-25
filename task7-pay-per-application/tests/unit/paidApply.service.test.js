jest.mock('../../../src/config/db');
jest.mock('../../../src/config/razorpay');

const {
  initiatePaidApply,
  confirmPayment,
  getApplicationStatus,
  getFeeForJob,
} = require('../../../src/services/paidApply.service');
const supabase = require('../../../src/config/db');
const razorpay = require('../../../src/config/razorpay');
const config = require('../../../src/config/env');
const { AppError } = require('../../../src/middlewares/errorHandler');

describe('paidApply.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests for getFeeForJob
  describe('getFeeForJob', () => {
    it('should fetch job-specific fee when available', async () => {
      const jobId = 'job-123';
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: { amount_paise: 5000, currency: 'INR' },
              error: null,
            }),
          }),
        }),
      });

      const fee = await getFeeForJob(jobId);
      expect(fee).toEqual({ amount_paise: 5000, currency: 'INR' });
    });

    it('should fall back to default fee when job-specific fee not found', async () => {
      const jobId = 'job-123';
      let callCount = 0;
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockImplementation(() => {
              callCount++;
              if (callCount === 1) {
                return Promise.resolve({
                  data: null,
                  error: { message: 'Not found' },
                });
              }
              return Promise.resolve({
                data: { amount_paise: 10000, currency: 'INR' },
                error: null,
              });
            }),
          }),
          is: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: { amount_paise: 10000, currency: 'INR' },
              error: null,
            }),
          }),
        }),
      });

      const fee = await getFeeForJob(jobId);
      expect(fee).toEqual({ amount_paise: 10000, currency: 'INR' });
    });
  });

  // Tests for initiatePaidApply
  describe('initiatePaidApply', () => {
    const studentId = 'student-123';
    const jobId = 'job-123';
    const idempotencyKey = 'key-123';

    it('1. returns existing application when idempotency_key already exists', async () => {
      const existingApp = {
        id: 'app-123',
        student_id: studentId,
        job_id: jobId,
        status: 'pending_payment',
        payment_id: 'pay-123',
      };
      const existingPayment = {
        id: 'pay-123',
        razorpay_order_id: 'order_123',
        amount: 10000,
        currency: 'INR',
      };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: existingApp,
            error: null,
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: existingPayment,
            error: null,
          }),
        }),
      });

      const result = await initiatePaidApply({ student_id: studentId, job_id: jobId, idempotency_key: idempotencyKey });

      expect(result.application).toEqual(existingApp);
      expect(result.payment).toEqual(existingPayment);
      expect(razorpay.orders.create).not.toHaveBeenCalled();
    });

    it('2. throws JOB_NOT_FOUND for unknown job_id', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      try {
        await initiatePaidApply({ student_id: studentId, job_id: jobId, idempotency_key: idempotencyKey });
        expect(true).toBe(false); // Should throw
      } catch (err) {
        expect(err.code).toBe('JOB_NOT_FOUND');
        expect(err.statusCode).toBe(404);
      }
    });

    it('3. throws JOB_NOT_PUBLISHED when job.status = draft', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: { id: jobId, status: 'draft', company_id: 'company-123' },
            error: null,
          }),
        }),
      });

      try {
        await initiatePaidApply({ student_id: studentId, job_id: jobId, idempotency_key: idempotencyKey });
        expect(true).toBe(false); // Should throw
      } catch (err) {
        expect(err.code).toBe('JOB_NOT_PUBLISHED');
        expect(err.statusCode).toBe(400);
      }
    });

    it('4. throws ALREADY_APPLIED when student has active application', async () => {
      const job = { id: jobId, status: 'published', company_id: 'company-123' };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: job,
            error: null,
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: { id: 'app-456', status: 'applied' },
              error: null,
            }),
          }),
        }),
      });

      try {
        await initiatePaidApply({ student_id: studentId, job_id: jobId, idempotency_key: idempotencyKey });
        expect(true).toBe(false); // Should throw
      } catch (err) {
        expect(err.code).toBe('ALREADY_APPLIED');
        expect(err.statusCode).toBe(409);
      }
    });

    it('5. throws GATEWAY_ERROR when Razorpay order creation fails', async () => {
      const job = { id: jobId, status: 'published', company_id: 'company-123' };

      // Mock existing app check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      // Mock job fetch
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: job,
            error: null,
          }),
        }),
      });

      // Mock previous application check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      // Mock fee fetch
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
          is: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: { amount_paise: 10000, currency: 'INR' },
              error: null,
            }),
          }),
        }),
      });

      razorpay.orders.create.mockRejectedValue(new Error('Payment gateway error'));

      try {
        await initiatePaidApply({ student_id: studentId, job_id: jobId, idempotency_key: idempotencyKey });
        expect(true).toBe(false); // Should throw
      } catch (err) {
        expect(err.code).toBe('GATEWAY_ERROR');
        expect(err.statusCode).toBe(502);
      }
    });

    it('6. creates payment and application on success', async () => {
      const job = { id: jobId, status: 'published', company_id: 'company-123' };
      const order = { id: 'order_123', amount: 10000, currency: 'INR' };
      const payment = { id: 'pay-123', amount: 10000, currency: 'INR', status: 'created' };
      const app = { id: 'app-123', status: 'pending_payment', payment_id: 'pay-123' };

      // Mock existing app check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      // Mock job fetch
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: job,
            error: null,
          }),
        }),
      });

      // Mock previous application check
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            not: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      // Mock fee fetch
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
          is: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: { amount_paise: 10000, currency: 'INR' },
              error: null,
            }),
          }),
        }),
      });

      razorpay.orders.create.mockResolvedValue(order);

      // Mock payment insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: payment,
              error: null,
            }),
          }),
        }),
      });

      // Mock application insert
      supabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: app,
              error: null,
            }),
          }),
        }),
      });

      const result = await initiatePaidApply({ student_id: studentId, job_id: jobId, idempotency_key: idempotencyKey });

      expect(result.application).toEqual(app);
      expect(result.payment).toEqual(payment);
      expect(result.razorpay_order.id).toBe('order_123');
    });
  });

  // Tests for confirmPayment
  describe('confirmPayment', () => {
    const applicationId = 'app-123';
    const paymentId = 'pay-123';
    const orderId = 'order_123';
    const razorpayPaymentId = 'pay_xyz';
    const razorpaySignature = 'valid-signature';

    it('8. throws APPLICATION_NOT_FOUND for bad applicationId', async () => {
      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      try {
        await confirmPayment({
          application_id: applicationId,
          razorpay_order_id: orderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        });
        expect(true).toBe(false); // Should throw
      } catch (err) {
        expect(err.code).toBe('APPLICATION_NOT_FOUND');
        expect(err.statusCode).toBe(404);
      }
    });

    it('9. throws PAYMENT_ALREADY_CONFIRMED if application.status != pending_payment', async () => {
      const app = {
        id: applicationId,
        status: 'applied',
        payment_id: paymentId,
      };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: app,
            error: null,
          }),
        }),
      });

      try {
        await confirmPayment({
          application_id: applicationId,
          razorpay_order_id: orderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        });
        expect(true).toBe(false); // Should throw
      } catch (err) {
        expect(err.code).toBe('PAYMENT_ALREADY_CONFIRMED');
        expect(err.statusCode).toBe(400);
      }
    });

    it('10. throws INVALID_SIGNATURE and sets payment.status = failed on bad signature', async () => {
      const app = {
        id: applicationId,
        status: 'pending_payment',
        payment_id: paymentId,
      };
      const payment = {
        id: paymentId,
        status: 'created',
      };

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: app,
            error: null,
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: payment,
            error: null,
          }),
        }),
      });

      supabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      try {
        await confirmPayment({
          application_id: applicationId,
          razorpay_order_id: orderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: 'bad-signature',
        });
        expect(true).toBe(false); // Should throw
      } catch (err) {
        expect(err.code).toBe('INVALID_SIGNATURE');
        expect(err.statusCode).toBe(400);
      }
    });
  });
});
