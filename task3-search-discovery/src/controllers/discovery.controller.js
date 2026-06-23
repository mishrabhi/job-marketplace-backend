import DiscoveryService from '../services/discovery.service.js';

export default class DiscoveryController {
  static async getFeed(req, res, next) {
    try {
      const { query } = req.validated;
      const { student_id } = query;
      const page = parseInt(query.page, 10) || 1;
      const limit = parseInt(query.limit, 10) || 20;

      const result = await DiscoveryService.getRankedFeed(student_id, page, limit);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getJobDetail(req, res, next) {
    try {
      const { id } = req.validated.params;
      const job = await DiscoveryService.getJobDetail(id);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }
}
