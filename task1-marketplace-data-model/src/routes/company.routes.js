import express from 'express';
import CompanyController from '../controllers/company.controller.js';
import validate from '../middlewares/validate.js';
import { registerCompanySchema, companyIdParamSchema, submitKycSchema } from '../validators/company.validator.js';

const router = express.Router();

router.post('/', validate(registerCompanySchema), CompanyController.register);
router.get('/:id', validate(companyIdParamSchema), CompanyController.getProfile);
router.patch('/:id/kyc', validate(submitKycSchema), CompanyController.submitKyc);
router.get('/:id/kyc', validate(companyIdParamSchema), CompanyController.getKycStatus);

export default router;
