import { logger } from '../config/logger.js';

// In-memory persistent state
let applications = [
  { id: "app_101", job_id: "job_01", student_id: "student_01", drive_id: "drive_01", candidate_name: "Aarav Sharma", status: "APPLIED", applied_at: "2026-08-10T10:00:00Z" },
  { id: "app_102", job_id: "job_01", student_id: "student_02", drive_id: "drive_01", candidate_name: "Priya Patel", status: "SHORTLISTED", applied_at: "2026-08-10T11:30:00Z" }
];

export const applicationRepository = {
  getJobApplicationsFromDB: async (jobId) => {
    logger.info(`🐢 [DB READ] Fetching applications for job '${jobId}'`);
    await new Promise(r => setTimeout(r, 150)); // Simulating DB latency
    return applications.filter(a => a.job_id === jobId);
  },

  getApplicationByIdFromDB: async (id) => {
    logger.info(`🐢 [DB READ] Fetching application detail '${id}'`);
    await new Promise(r => setTimeout(r, 100));
    return applications.find(a => a.id === id) || null;
  },

  updateApplicationStatusInDB: async (id, status) => {
    logger.info(`✍️ [DB WRITE] Updating application '${id}' status to '${status}'`);
    const app = applications.find(a => a.id === id);
    if (!app) return null;
    app.status = status;
    return { ...app };
  },

  createApplicationInDB: async (newApp) => {
    logger.info(`✍️ [DB WRITE] Creating new application for student '${newApp.student_id}'`);
    const app = { id: `app_${Date.now()}`, ...newApp, applied_at: new Date().toISOString() };
    applications.push(app);
    return app;
  }
};