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

  static async listStudentApplications(req, res, next) {
    try {
      const { student_id } = req.validated.query;
      const page = parseInt(req.validated.query.page || 1, 10);
      const limit = parseInt(req.validated.query.limit || 20, 10);
      const offset = (page - 1) * limit;

      const applications = await ApplicationService.getStudentApplications(student_id, limit, offset);
      res.json({ success: true, data: applications, meta: { page, limit } });
    } catch (error) {
      next(error);
    }
  }

  static async withdraw(req, res, next) {
    try {
      const { id } = req.validated.params;
      const application = await ApplicationService.withdrawApplication(id);
      res.json({ success: true, data: application });
    } catch (error) {
      next(error);
    }
  }
}
