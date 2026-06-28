import request from ('supertest');
import app from ('../../app');
import supabase from ('../../src/config/db');

jest.mock('../../src/config/db', () => ({
  from: jest.fn()
}));

describe('Resilience and Failure APIs integration suite framework', () => {
  test('GET /api/v1/failures/summary returns correct aggregated payload configuration models', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ count: 0, error: null })
    }));

    const response = await request(app)
      .get('/api/v1/failures/summary')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.healthy).toBe(true);
    expect(response.body.data.summary.failed_payments).toBe(0);
  });
});