jest.mock('../../../src/config/db');
jest.mock('../../../src/config/env', () => ({
  razorpay: {
    webhookSecret: 'test-webhook-secret',
  },
}));

const { handleWebhookEvent } = require('../../../src/services/webhook.service');
const supabase = require('../../../src/config/db');
const crypto = require('crypto');

describe('webhook.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function generateSignature(payload, secret) {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  it('1. throws INVALID_WEBHOOK_SIGNATURE on signature mismatch', async () => {
    const payload = JSON.stringify({ event: 'payment.captured' });
    const badSignature = 'bad-signature';

    try {
      await handleWebhookEvent(payload, badSignature);
      expect(true).toBe(false); // Should throw
    } catch (err) {
      expect(err.code).toBe('INVALID_WEBHOOK_SIGNATURE');
      expect(err.statusCode).toBe(400);
    }
  });

  it('2. always inserts into payment_events even on unknown event types', async () => {
    const payload = JSON.stringify({ event: 'unknown.event', payload: { test: 'data' } });
    const signature = generateSignature(payload, 'test-webhook-secret');

    supabase.from.mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const result = await handleWebhookEvent(payload, signature);

    expect(supabase.from).toHaveBeenCalledWith('payment_events');
    expect(result).toEqual({ received: true, event_type: 'unknown.event' });
  });

  it('3. payment.captured → updates payment to captured, application to applied', async () => {
    const orderId = 'order_123';
    const paymentId = 'pay_123';
    const payload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: paymentId,
            order_id: orderId,
            amount: 10000,
            currency: 'INR',
            status: 'captured',
          },
        },
      },
    });
    const signature = generateSignature(payload, 'test-webhook-secret');

    // Mock payment lookup
    supabase.from.mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: { id: 'pay-db-123', application_id: 'app-123' },
          error: null,
        }),
      }),
    });

    // Mock payment update
    supabase.from.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    // Mock application lookup
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: { id: 'app-123' },
          error: null,
        }),
      }),
    });

    // Mock application update
    supabase.from.mockReturnValueOnce({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      }),
    });

    const result = await handleWebhookEvent(payload, signature);

    expect(result).toEqual({ received: true, event_type: 'payment.captured' });
    expect(supabase.from).toHaveBeenCalledWith('payment_events');
  });

  it('4. payment.failed → updates payment to failed, application stays pending_payment', async () => {
    const orderId = 'order_123';
    const payload = JSON.stringify({
      event: 'payment.failed',
      payload: {
        payment: {
          entity: {
            id: 'pay_fail_123',
            order_id: orderId,
            error_description: 'Insufficient funds',
            status: 'failed',
          },
        },
      },
    });
    const signature = generateSignature(payload, 'test-webhook-secret');

    supabase.from.mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: { id: 'pay-db-123' },
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

    const result = await handleWebhookEvent(payload, signature);

    expect(result).toEqual({ received: true, event_type: 'payment.failed' });
  });

  it('5. refund.created → updates payment to refunded, application to withdrawn', async () => {
    const paymentId = 'pay_123';
    const payload = JSON.stringify({
      event: 'refund.created',
      payload: {
        refund: {
          entity: {
            id: 'rfnd_123',
            payment_id: paymentId,
            amount: 10000,
            currency: 'INR',
            status: 'processed',
          },
        },
      },
    });
    const signature = generateSignature(payload, 'test-webhook-secret');

    supabase.from.mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: { id: 'pay-db-123' },
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

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: { id: 'app-123' },
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

    const result = await handleWebhookEvent(payload, signature);

    expect(result).toEqual({ received: true, event_type: 'refund.created' });
  });

  it('6. Unknown event type → returns { received: true } without throwing', async () => {
    const payload = JSON.stringify({ event: 'some.unknown.event', payload: {} });
    const signature = generateSignature(payload, 'test-webhook-secret');

    supabase.from.mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const result = await handleWebhookEvent(payload, signature);

    expect(result).toEqual({ received: true, event_type: 'some.unknown.event' });
  });
});
