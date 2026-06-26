import reconciliationService from '../services/reconciliation.service';
import reconciliationQuerySchema from '../validators/receiptsRefunds.validator';

export default generateReport = async (req, res, next) => {
  try {
    const { date } = reconciliationQuerySchema.parse(req.query);
    const report = await reconciliationService.generateReconciliationReport(date);
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export default getReport = async (req, res, next) => {
  try {
    const { date } = reconciliationQuerySchema.parse(req.query);
    const report = await reconciliationService.getReconciliationReport(date);
    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

export default listReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const result = await reconciliationService.listReconciliationReports({ page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

