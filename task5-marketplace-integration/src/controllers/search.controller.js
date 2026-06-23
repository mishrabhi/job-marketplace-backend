import SearchService from '../services/search.service.js';

export default class SearchController {
  static async search(req, res, next) {
    try {
      const { query } = req.validated;
      const result = await SearchService.searchJobs(query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
