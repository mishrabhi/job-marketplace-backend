import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Validates data access claims to strictly isolate cross-tenant visibility 
 */
const verifyTenantBoundaryAccess = async (collegeId, userId) => {
  const { data: permissions, error } = await supabase
    .from('college_admins')
    .select('id, is_active')
    .eq('college_id', collegeId)
    .eq('user_identity_id', userId)
    .maybeSingle();

  if (error) throw appError(500, 'TENANT_CHECK_ERROR', error.message);
  if (!permissions || !permissions.is_active) {
    logger.error(`🚨 Security breach blocked: User ${userId} tried accessing College data room: ${collegeId}`);
    throw appError(403, 'TENANT_ACCESS_DENIED', 'Access Denied: You do not own authorization clearances for this tenant segment.');
  }
};

/**
 * Compiles real extended dashboard statistics from database persistence layer 
 */
export const fetchExtendedPlacementAnalytics = async (collegeId, requestingUserId) => {
  logger.info(`Compiling extended dashboard indicators data report matrix for college: ${collegeId}`);

  // Enforce isolation boundary checking immediately 
  await verifyTenantBoundaryAccess(collegeId, requestingUserId);

  const { data: analytics, error } = await supabase
    .from('view_college_placement_analytics')
    .eq('college_id', collegeId)
    .maybeSingle();

  if (error) throw appError(500, 'DB_ERROR', error.message);

  if (!analytics) {
    return { college_id: collegeId, message: "No operational platform metrics gathered for this slice." };
  }

  // Map business values making distinct metrics actionable for clear decisions 
  return {
    college_id: analytics.college_id,
    college_name: analytics.college_name,
    student_funnel: {
      total_students_registered: analytics.total_students,
      total_applications_filed: analytics.total_applications,
      shortlists_count: analytics.total_shortlists,
      offers_secured: analytics.total_offers
    },
    compensation_analytics: {
      highest_package_inr: analytics.highest_package_paise / 100,
      average_package_inr: analytics.average_package_paise / 100
    }
  };
};