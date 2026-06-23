import ThresholdService from '../../src/services/threshold.service.js';
import Job from '../../src/models/Job.js';
import SkillThreshold from '../../src/models/SkillThreshold.js';
import { query } from '../../src/config/db.js';

jest.mock('../../src/models/Job.js');
jest.mock('../../src/models/SkillThreshold.js');
jest.mock('../../src/config/db.js');

describe('ThresholdService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('checks eligibility when student meets thresholds', async () => {
    Job.findById.mockResolvedValue({ id: 'job1', status: 'published' });
    query.mockResolvedValue({ rows: [{ skill_scores: { sk1: 70 } }] });
    SkillThreshold.findByJobId.mockResolvedValue([{ skill_id: 'sk1', min_level: 60 }]);

    const result = await ThresholdService.checkStudentEligibility('student1', 'job1');

    expect(result.eligible).toBe(true);
    expect(result.failures).toHaveLength(0);
  });

  it('marks ineligible when student below threshold', async () => {
    Job.findById.mockResolvedValue({ id: 'job1', status: 'published' });
    query.mockResolvedValue({ rows: [{ skill_scores: { sk1: 45 } }] });
    SkillThreshold.findByJobId.mockResolvedValue([{ skill_id: 'sk1', min_level: 60 }]);

    const result = await ThresholdService.checkStudentEligibility('student1', 'job1');

    expect(result.eligible).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].reason).toBe('THRESHOLD_NOT_MET');
  });
});
