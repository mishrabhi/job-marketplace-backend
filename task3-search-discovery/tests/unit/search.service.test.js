import SearchService from '../../src/services/search.service.js';
import { query } from '../../src/config/db.js';

jest.mock('../../src/config/db.js');

describe('SearchService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('searches jobs with query', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { id: '1', company_id: 'comp1', title: 'Backend Role', description: 'Build', status: 'published' }
      ]
    });
    query.mockResolvedValueOnce({
      rows: [{ count: 1 }]
    });

    const result = await SearchService.searchJobs({ q: 'Backend', page: 1, limit: 20 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('returns empty results when no matches', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [{ count: 0 }] });

    const result = await SearchService.searchJobs({ q: 'Nonexistent', page: 1, limit: 20 });

    expect(result.data).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});
