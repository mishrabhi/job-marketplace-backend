import * as applicationService from '../services/application.service.js';

export const handleGetJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const result = await applicationService.getApplicationsByJob(jobId);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const handleGetApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await applicationService.getApplicationById(id);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const handleUpdateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await applicationService.updateStatusAndInvalidate(id, status);
    return res.status(200).json({
      success: true,
      message: 'Status updated and associated cache tags evicted successfully',
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

export const handleCreateApplication = async (req, res, next) => {
  try {
    const created = await applicationService.createApplicationAndInvalidate(req.body);
    return res.status(201).json({
      success: true,
      message: 'Application submitted and job cache invalidated',
      data: created
    });
  } catch (err) {
    next(err);
  }
};