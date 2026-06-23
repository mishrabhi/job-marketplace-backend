import Company from '../models/Company.js';
import KYC from '../models/KYC.js';

export default class CompanyService {
  static async registerCompany({ name, email, phone }) {
    const existingCompany = await Company.findByEmail(email);
    if (existingCompany) {
      const error = new Error('Company with this email already exists');
      error.status = 409;
      error.code = 'DUPLICATE_COMPANY';
      throw error;
    }

    return Company.create({ name, email, phone });
  }

  static async getCompanyProfile(companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      const error = new Error('Company not found');
      error.status = 404;
      error.code = 'COMPANY_NOT_FOUND';
      throw error;
    }
    return company;
  }

  static async submitKyc(companyId, { doc_type, storage_url }) {
    const company = await Company.findById(companyId);
    if (!company) {
      const error = new Error('Company not found');
      error.status = 404;
      error.code = 'COMPANY_NOT_FOUND';
      throw error;
    }

    const kyc = await KYC.upsert({ companyId, docType: doc_type, url: storage_url });
    await Company.updateKycStatus(companyId, 'submitted');
    return kyc;
  }

  static async getKycStatus(companyId) {
    const company = await Company.findById(companyId);
    if (!company) {
      const error = new Error('Company not found');
      error.status = 404;
      error.code = 'COMPANY_NOT_FOUND';
      throw error;
    }
    const kyc = await KYC.findByCompanyId(companyId);
    return kyc || { company_id: companyId, status: 'not_submitted' };
  }
}
