const webhookService = require('../../task6-payments/src/services/webhook.service');
const supabase = require('../../task6-payments/src/config/db');

jest.mock('../../task6-payments/src/config/db');

describe('webhook.service', () => {
  beforeEach(() => jest.resetAllMocks());

  test('handleWebhookEvent throws INVALID_WEBHOOK_SIGNATURE on bad signature', async () => {
    const raw = Buffer.from('{"event":"payment.captured"}');
    await expect(webhookService.handleWebhookEvent(raw, 'bad', 'secret')).rejects.toMatchObject({ code: 'INVALID_WEBHOOK_SIGNATURE' });
  });
});
