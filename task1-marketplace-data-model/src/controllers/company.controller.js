import CompanyService from '../services/company.service.js';

export default class CompanyController {
  static async register(req, res, next) {
    try {
      const { body } = req.validated;
      const company = await CompanyService.registerCompany(body);
      res.status(201).json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const { id } = req.validated.params;
      const company = await CompanyService.getCompanyProfile(id);
      res.json({ success: true, data: company });
    } catch (error) {
      next(error);
    }
  }

  static async submitKyc(req, res, next) {
    try {
      const { id } = req.validated.params;
      const { body } = req.validated;
      const kyc = await CompanyService.submitKyc(id, body);
      res.json({ success: true, data: kyc });
    } catch (error) {
      next(error);
    }
  }

  static async getKycStatus(req, res, next) {
    try {
      const { id } = req.validated.params;
      const status = await CompanyService.getKycStatus(id);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }
}
