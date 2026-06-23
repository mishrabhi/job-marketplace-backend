import ShortlistService from '../services/shortlist.service.js';

export default class ShortlistController {
  static async shortlist(req, res, next) {
    try {
      const { body } = req.validated;
      const shortlist = await ShortlistService.shortlistCandidate(body);
      res.status(201).json({ success: true, data: shortlist });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req, res, next) {
    try {
      const { body } = req.validated;
      const shortlist = await ShortlistService.rejectCandidate(body);
      res.status(201).json({ success: true, data: shortlist });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req, res, next) {
    try {
      const { id } = req.validated.params;
      const shortlist = await ShortlistService.getShortlistStatus(id);
      res.json({ success: true, data: shortlist });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { id } = req.validated.params;
      const { status, note } = req.validated.body;
      const updated = await ShortlistService.updateShortlistStatus(id, status, note);
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async listCandidates(req, res, next) {
    try {
      const { job_id, company_id } = req.validated.query;
      const page = parseInt(req.validated.query.page || 1, 10);
      const limit = parseInt(req.validated.query.limit || 20, 10);
      const offset = (page - 1) * limit;

      const candidates = await ShortlistService.listCandidatesForJob(job_id, company_id, limit, offset);
      res.json({ success: true, data: candidates, meta: { page, limit } });
    } catch (error) {
      next(error);
    }
  }
}
