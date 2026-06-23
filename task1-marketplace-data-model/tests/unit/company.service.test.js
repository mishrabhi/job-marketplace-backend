import CompanyService from '../../src/services/company.service.js';
import Company from '../../src/models/Company.js';

jest.mock('../../src/models/Company.js');

describe('CompanyService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('registers a new company', async () => {
    Company.findByEmail.mockResolvedValue(null);
    Company.create.mockResolvedValue({ id: '123', name: 'Acme', email: 'a@a.com', phone: '123', kyc_status: 'pending' });

    const result = await CompanyService.registerCompany({ name: 'Acme', email: 'a@a.com', phone: '123' });

    expect(result).toEqual(expect.objectContaining({ email: 'a@a.com' }));
    expect(Company.create).toHaveBeenCalled();
  });

  it('throws when duplicate email exists', async () => {
    Company.findByEmail.mockResolvedValue({ id: '123' });

    await expect(
      CompanyService.registerCompany({ name: 'Acme', email: 'a@a.com', phone: '123' })
    ).rejects.toMatchObject({ status: 409, code: 'DUPLICATE_COMPANY' });
  });
});
