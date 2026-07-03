import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Validates data access claims to strictly isolate cross-tenant visibility 
 */
const enforceTenantIsolationBoundaries = async (collegeId, userId) => {
  const { data: claims, error } = await supabase
    .from('college_admins')
    .select('id, college_id, is_active')
    .eq('college_id', collegeId)
    .eq('user_identity_id', userId)
    .maybeSingle();

  if (error) throw appError(500, 'TENANT_CHECK_ERROR', error.message);
  if (!claims || !claims.is_active) {
    logger.error(`🚨 Unauthorized tenancy access attempt recorded for User: ${userId} over College: ${collegeId}`);
    throw appError(403, 'TENANT_ACCESS_DENIED', 'Unauthorized Access: You do not possess structural viewing rights for this institution.');
  }
};

/**
 * Collects aggregated placement analytics for a specific college tenant 
 */
export const compileCollegeMetricsReport = async (collegeId, requestingUserId) => {
  logger.info(`Compiling reporting matrix analytics data summary for college: ${collegeId}`);
  
  // Enforce tenant protection rules immediately 
  await enforceTenantIsolationBoundaries(collegeId, requestingUserId);

  // Fetch student roster linked strictly to this college context 
  const { data: students, error: sErr } = await supabase
    .from('students')
    .select('id, application_id')
    .eq('college_id', collegeId);

  if (sErr) throw appError(500, 'DB_ERROR', sErr.message);

  const studentIds = students?.map(s => s.id) || [];
  
  if (studentIds.length === 0) {
    return { college_id: collegeId, total_students_indexed: 0, application_count: 0, hiring_success_percentage: "0.00" };
  }

  // Fetch corresponding applications for the student roster to aggregate metrics safely 
  const { data: applications, error: aErr } = await supabase
    .from('applications')
    .select('id, status')
    .in('student_id', studentIds);

  if (aErr) throw appError(500, 'DB_ERROR', aErr.message);

  const totalApps = applications?.length || 0;
  const closedHires = applications?.filter(app => ['offer_generated', 'signed'].includes(app.status)).length || 0;

  return {
    college_id: collegeId,
    total_students_indexed: studentIds.length,
    application_count: totalApps,
    metrics_summary: {
      secured_placements: closedHires,
      hiring_success_percentage: totalApps === 0 ? "0.00" : ((closedHires / totalApps) * 100).toFixed(2)
    }
  };
};

/**
 * Provisions a new college administrator role 
 */
export const registerNewCollegeAdmin = async ({ college_id, user_identity_id, role_title }) => {
  logger.info(`Provisioning administrative directory claim entry parameters for role: ${role_title}`);

  const { data: newAdmin, error } = await supabase
    .from('college_admins')
    .insert([{ college_id, user_identity_id, role_title, is_active: true }])
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return newAdmin;
};