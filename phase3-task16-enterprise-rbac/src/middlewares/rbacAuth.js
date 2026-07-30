import { supabase } from '../config/db.js';
import { appError } from './errorHandler.js';

/**
 * Enforces Tenant Boundaries and Granular Permission Checks[cite: 18]
 */
export const enforceRBAC = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const tenantId = req.headers['x-tenant-id'];
      const userId = req.headers['x-user-id'];

      if (!tenantId || !userId) {
        return next(appError(401, 'UNAUTHORIZED', 'Missing mandatory x-tenant-id or x-user-id headers.'));
      }

      // Query membership and role permissions
      const { data: membership, error } = await supabase
        .from('tenant_user_memberships')
        .select('role_name, rbac_roles(permissions)')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error || !membership) {
        return next(appError(403, 'FORBIDDEN_TENANT_ACCESS', 'User does not belong to the requested tenant context.'));
      }

      const grantedPermissions = membership.rbac_roles?.permissions || [];
      if (requiredPermission && !grantedPermissions.includes(requiredPermission)) {
        return next(appError(403, 'INSUFFICIENT_PERMISSIONS', `Required permission '${requiredPermission}' not granted.`));
      }

      // Attach context to request object
      req.userContext = {
        userId,
        tenantId,
        role: membership.role_name,
        permissions: grantedPermissions
      };

      next();
    } catch (err) {
      next(err);
    }
  };
};