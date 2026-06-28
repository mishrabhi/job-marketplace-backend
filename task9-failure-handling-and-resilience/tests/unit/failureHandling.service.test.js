import failureHandlingService from ('../../src/services/failureHandling.service');
import supabase from ('../../src/config/db');
import razorpay from ('../../src/config/razorpay');

jest.mock('../../src/config/db', () => ({
  from: jest.fn()
}));
jest.mock('../../src/config/razorpay', () => ({
  payments: {
    refund: jest.fn()
  }
}));
jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  payment: jest.fn(),
  failure: jest.fn()
}));

describe('failureHandling service test structural assertions suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('detectStuckPayments returns empty array when no stuck payments exist', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lt: jest.fn().mockResolvedValue({ data: [], error: null })
    }));

    const result = await failureHandlingService.detectStuckPayments();
    expect(result.count).toBe(0);
    expect(result.stuck).toEqual([]);
  });

  test('recoverPayment throws PAYMENT_NOT_FOUND for unknown paymentId', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
    }));

    await expect(
      failureHandlingService.recoverPayment('6a226759-42b7-47b2-8490-67bc1e09bc48', { action: 'dismiss' })
    ).rejects.toThrow('Payment record does not exist');
  });

  test('recoverPayment throws INVALID_RECOVERY_ACTION when action does not match payment status', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { status: 'failed' }, error: null })
    }));

    await expect(
      failureHandlingService.recoverPayment('6a226759-42b7-47b2-8490-67bc1e09bc48', { action: 'mark_captured' })
    ).rejects.toThrow('Cannot capture payment from status failed');
  });
});