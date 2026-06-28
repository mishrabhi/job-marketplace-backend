import webhookRetryService from ('../../src/services/webhookRetry.service');
import supabase from ('../../src/config/db');

jest.mock('../../src/config/db', () => ({
  from: jest.fn()
}));
jest.mock('../../src/services/webhook.service', () => ({
  handleWebhookEvent: jest.fn()
}));

describe('webhookRetry service tests validation workspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('enqueueWebhook inserts a row into webhook_retry_queue with status pending', async () => {
    const mockPayload = { event: 'payment.captured' };
    supabase.from.mockImplementation(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'uuid-123', status: 'pending' }, error: null })
    }));

    const res = await webhookRetryService.enqueueWebhook('payment.captured', mockPayload, 'sig');
    expect(res.status).toBe('pending');
    expect(res.id).toBe('uuid-123');
  });

  test('processRetryQueue does nothing when queue is empty', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null })
    }));

    const executionSummary = await webhookRetryService.processRetryQueue();
    expect(executionSummary.processed).toBe(0);
    expect(executionSummary.succeeded).toBe(0);
  });
});