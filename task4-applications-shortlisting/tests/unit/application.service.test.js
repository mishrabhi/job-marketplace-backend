import ApplicationService from '../../src/services/application.service.js';
import Application from '../../src/models/Application.js';
import { query } from '../../src/config/db.js';

jest.mock('../../src/models/Application.js');
jest.mock('../../src/config/db.js');

describe('ApplicationService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates application with idempotency key', async () => {
    Application.findByIdempotencyKey.mockResolvedValue(null);
    query.mockResolvedValueOnce({ rows: [{ id: 'job1', status: 'published' }] });
    query.mockResolvedValueOnce({ rows: [{ id: 'student1' }] });
    Application.findByJobAndStudent.mockResolvedValue(null);
    Application.create.mockResolvedValue({
      id: 'app1',
      job_id: 'job1',
      student_id: 'student1',
      status: 'applied',
      idempotency_key: 'key1'
    });

    const result = await ApplicationService.applyToJob({
      jobId: 'job1',
      studentId: 'student1',
      idempotencyKey: 'key1'
    });

    expect(result.id).toBe('app1');
    expect(Application.create).toHaveBeenCalled();
  });

  it('returns existing application on duplicate idempotency key', async () => {
    const existing = {
      id: 'app1',
      job_id: 'job1',
      student_id: 'student1',
      status: 'applied',
      idempotency_key: 'key1'
    };
    Application.findByIdempotencyKey.mockResolvedValue(existing);

    const result = await ApplicationService.applyToJob({
      jobId: 'job1',
      studentId: 'student1',
      idempotencyKey: 'key1'
    });

    expect(result.id).toBe('app1');
    expect(Application.create).not.toHaveBeenCalled();
  });

  it('throws when idempotency key missing', async () => {
    await expect(
      ApplicationService.applyToJob({
        jobId: 'job1',
        studentId: 'student1',
        idempotencyKey: null
      })
    ).rejects.toMatchObject({ status: 400, code: 'IDEMPOTENCY_KEY_REQUIRED' });
  });

  it('throws when job not published', async () => {
    Application.findByIdempotencyKey.mockResolvedValue(null);
    query.mockResolvedValueOnce({ rows: [{ id: 'job1', status: 'draft' }] });

    await expect(
      ApplicationService.applyToJob({
        jobId: 'job1',
        studentId: 'student1',
        idempotencyKey: 'key1'
      })
    ).rejects.toMatchObject({ status: 400, code: 'JOB_NOT_PUBLISHED' });
  });
});
