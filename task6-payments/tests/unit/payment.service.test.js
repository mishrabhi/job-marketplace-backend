const paymentService = require('../../task6-payments/src/services/payment.service');
const supabase = require('../../task6-payments/src/config/db');
const razorpay = require('../../task6-payments/src/config/razorpay');

jest.mock('../../task6-payments/src/config/db');
jest.mock('../../task6-payments/src/config/razorpay');

describe('payment.service', () => {
  beforeEach(() => jest.resetAllMocks());

  test('createOrder returns existing payment when idempotency_key exists', async () => {
    supabase.from = jest.fn().mockReturnThis();
    supabase.select = jest.fn().mockReturnThis();
    supabase.eq = jest.fn().mockReturnThis();
    supabase.single = jest.fn().mockResolvedValue({ data: { id: 'existing' } });

    const res = await paymentService.createOrder({ application_id: 'a', student_id: 'b', company_id: 'c', amount_paise: 100, idempotency_key: 'k1' });
    expect(res.payment.id).toBe('existing');
  });
});
