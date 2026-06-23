import JobService from '../../src/services/job.service.js';
import Job from '../../src/models/Job.js';
import SkillThreshold from '../../src/models/SkillThreshold.js';
import AssessmentLink from '../../src/models/AssessmentLink.js';

jest.mock('../../src/models/Job.js');
jest.mock('../../src/models/SkillThreshold.js');
jest.mock('../../src/models/AssessmentLink.js');

describe('JobService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a job with thresholds', async () => {
    Job.create.mockResolvedValue({ id: '123', company_id: 'comp1', title: 'Role', description: 'Desc', status: 'draft' });
    SkillThreshold.create.mockResolvedValue({ id: 'st1', job_id: '123', skill_id: 'sk1', min_level: 60 });
    SkillThreshold.findByJobId.mockResolvedValue([{ id: 'st1', job_id: '123', skill_id: 'sk1', min_level: 60 }]);

    const result = await JobService.createJob({
      companyId: 'comp1',
      title: 'Role',
      description: 'Desc',
      thresholds: [{ skill_id: 'sk1', min_level: 60 }]
    });

    expect(result.id).toBe('123');
    expect(result.thresholds).toHaveLength(1);
  });

  it('throws if no thresholds provided', async () => {
    await expect(
      JobService.createJob({
        companyId: 'comp1',
        title: 'Role',
        description: 'Desc',
        thresholds: []
      })
    ).rejects.toMatchObject({ status: 400, code: 'THRESHOLDS_REQUIRED' });
  });
});
