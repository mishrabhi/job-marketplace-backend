import * as sampleService from '../services/sample.service.js';

export const handleGetSample = (req, res, next) => {
  try {
    const data = sampleService.getWelcomeMessage();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};