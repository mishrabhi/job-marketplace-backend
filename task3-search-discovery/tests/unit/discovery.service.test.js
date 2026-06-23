import DiscoveryService from '../../src/services/discovery.service.js';
import { query } from '../../src/config/db.js';

jest.mock('../../src/config/db.js');

describe('DiscoveryService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns ranked feed for student', async () => {
    query.mockResolvedValueOnce({
      rows: [{ skill_scores: { sk1: 70 } }]
    });
    query.mockResolvedValueOnce({
      rows: [
        { id: '1', company_id: 'comp1', title: 'Role', description: 'Desc', status: 'published', thresholds: [{ skill_id: 'sk1', min_level: 60 }] }
      ]
    });
    query.mockResolvedValueOnce({
      rows: [{ count: 1 }]
    });

    const result = await DiscoveryService.getRankedFeed('student1', 1, 20);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].match_score).toBe(100);
  });

  it('throws when student not found', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    await expect(
      DiscoveryService.getRankedFeed('nonexistent', 1, 20)
    ).rejects.toMatchObject({ status: 404, code: 'STUDENT_NOT_FOUND' });
  });
});
