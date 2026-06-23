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
}
