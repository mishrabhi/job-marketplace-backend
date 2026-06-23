import ApplicationService from '../services/application.service.js';

export default class ApplicationController {
  static async apply(req, res, next) {
    try {
      const { body } = req.validated;
      const idempotencyKey = req.headers['idempotency-key'];

      const application = await ApplicationService.applyToJob({
        jobId: body.job_id,
        studentId: body.student_id,
        idempotencyKey
      });

      res.status(201).json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req, res, next) {
    try {
      const { id } = req.validated.params;
      const application = await ApplicationService.getApplicationStatus(id);
      res.json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  }
}
