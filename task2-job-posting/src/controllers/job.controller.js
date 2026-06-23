import JobService from '../services/job.service.js';

export default class JobController {
  static async create(req, res, next) {
    try {
      const { body } = req.validated;
      const job = await JobService.createJob(body);
      res.status(201).json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  static async getJob(req, res, next) {
    try {
      const { id } = req.validated.params;
      const job = await JobService.getJob(id);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  static async publish(req, res, next) {
    try {
      const { id } = req.validated.params;
      const { body } = req.validated;
      const result = await JobService.publishJob(id, body.company_id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAssessmentLink(req, res, next) {
    try {
      const { id } = req.validated.params;
      const link = await JobService.getAssessmentLink(id);
      res.json({ success: true, data: link });
    } catch (error) {
      next(error);
    }
  }
}
