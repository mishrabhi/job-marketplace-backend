import ShortlistService from '../../src/services/shortlist.service.js';
import Application from '../../src/models/Application.js';
import Shortlist from '../../src/models/Shortlist.js';
import { query } from '../../src/config/db.js';

jest.mock('../../src/models/Application.js');
jest.mock('../../src/models/Shortlist.js');
jest.mock('../../src/config/db.js');

describe('ShortlistService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shortlists a candidate', async () => {
    Application.findById.mockResolvedValue({
      id: 'app1',
      job_id: 'job1',
      student_id: 'student1'
    });
    query.mockResolvedValue({ rows: [{ company_id: 'comp1' }] });
    Shortlist.findByApplicationId.mockResolvedValue(null);
    Shortlist.create.mockResolvedValue({
      id: 'sl1',
      application_id: 'app1',
      company_id: 'comp1',
      status: 'shortlisted'
    });

    const result = await ShortlistService.shortlistCandidate({
      applicationId: 'app1',
      companyId: 'comp1'
    });

    expect(result.status).toBe('shortlisted');
    expect(Shortlist.create).toHaveBeenCalled();
  });

  it('throws when unauthorized company', async () => {
    Application.findById.mockResolvedValue({
      id: 'app1',
      job_id: 'job1',
      student_id: 'student1'
    });
    query.mockResolvedValue({ rows: [{ company_id: 'comp1' }] });

    await expect(
      ShortlistService.shortlistCandidate({
        applicationId: 'app1',
        companyId: 'comp2'
      })
    ).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' });
  });
});
