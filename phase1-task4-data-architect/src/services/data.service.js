import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

export const registerStudent = async (studentData) => {
  logger.info(`Registering student profile for: ${studentData.email}`);

  const { data, error } = await supabase
    .from('students')
    .insert([studentData])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Postgres Unique Violation
      throw appError(409, 'DUPLICATE_EMAIL', 'A student with this email address already exists.');
    }
    if (error.code === '23503') { // Foreign Key Violation
      throw appError(400, 'INVALID_COLLEGE', 'The specified college does not exist.');
    }
    throw appError(500, 'DB_ERROR', error.message);
  }

  return data;
};

export const applyToJobWithIntegrity = async (jobId, studentId) => {
  logger.info(`Processing job application for student ${studentId} to job ${jobId}`);

  // 1. Verify Job existence and eligibility
  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .select('id, min_gpa, status')
    .eq('id', jobId)
    .single();

  if (jobErr || !job) throw appError(404, 'JOB_NOT_FOUND', 'Job posting does not exist.');
  if (job.status !== 'OPEN') throw appError(400, 'JOB_CLOSED', 'This job posting is not accepting applications.');

  // 2. Verify Student GPA meets job requirements
  const { data: student, error: studentErr } = await supabase
    .from('students')
    .select('id, gpa, status')
    .eq('id', studentId)
    .single();

  if (studentErr || !student) throw appError(404, 'STUDENT_NOT_FOUND', 'Student profile does not exist.');
  if (student.gpa < job.min_gpa) {
    throw appError(400, 'INELIGIBLE_GPA', `Student GPA (${student.gpa}) does not meet minimum job criteria (${job.min_gpa}).`);
  }

  // 3. Insert Application with uniqueness constraint
  const { data: application, error: appErr } = await supabase
    .from('applications')
    .insert([{ job_id: jobId, student_id: studentId, status: 'APPLIED' }])
    .select()
    .single();

  if (appErr) {
    if (appErr.code === '23505') {
      throw appError(409, 'DUPLICATE_APPLICATION', 'Student has already submitted an application to this job.');
    }
    throw appError(500, 'DB_ERROR', appErr.message);
  }

  return application;
};