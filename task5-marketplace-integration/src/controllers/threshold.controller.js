import ThresholdService from '../services/threshold.service.js';

export default class ThresholdController {
  static async checkEligibility(req, res, next) {
    try {
      const { body } = req.validated;
      const result = await ThresholdService.checkStudentEligibility(
        body.student_id,
        body.job_id
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
