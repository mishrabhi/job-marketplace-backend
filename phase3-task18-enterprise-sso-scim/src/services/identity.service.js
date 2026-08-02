import crypto from 'crypto';
import { supabase } from '../config/db.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

/**
 * Stage B: Configures SSO Identity Provider settings for an enterprise tenant
 */
export const upsertSSOConfiguration = async (payload) => {
  const { tenant_id, idp_entity_id, sso_login_url, certificate_fingerprint, protocol, allow_break_glass } = payload;
  logger.info(`Updating SSO SAML/OIDC policy configuration for tenant: ${tenant_id}`);

  const { data, error } = await supabase
    .from('tenant_sso_configs')
    .upsert({
      tenant_id,
      idp_entity_id,
      sso_login_url,
      certificate_fingerprint,
      protocol,
      allow_break_glass
    }, { onConflict: 'tenant_id' })
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return data;
};

/**
 * Stage C: SCIM 2.0 User Provisioning (Joiner lifecycle event)
 */
export const provisionSCIMUser = async (tenantId, payload) => {
  const { external_idp_id, email, first_name, last_name } = payload;
  const initialSessionToken = `sess_active_${crypto.randomBytes(16).toString('hex')}`;

  logger.info(`SCIM PROVISION: Provisioning identity ${email} (${external_idp_id}) for tenant: ${tenantId}`);

  const { data: identity, error } = await supabase
    .from('scim_provisioned_identities')
    .upsert({
      external_idp_id,
      tenant_id: tenantId,
      email,
      first_name,
      last_name,
      user_status: 'active',
      active_session_token: initialSessionToken,
      updated_at: new Date().toISOString()
    }, { onConflict: 'external_idp_id' })
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  return identity;
};

/**
 * Stage D: SCIM 2.0 Immediate User Deprovisioning & Session Revocation (Leaver lifecycle event)
 */
export const deprovisionSCIMUser = async (tenantId, externalIdpId) => {
  logger.warn(`🚨 SCIM DEPROVISION: Revoking immediate access for IdP user: ${externalIdpId} in tenant: ${tenantId}`);

  // Revoke active session token immediately and update status
  const { data: revokedUser, error } = await supabase
    .from('scim_provisioned_identities')
    .update({
      user_status: 'deprovisioned',
      active_session_token: null,
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('external_idp_id', externalIdpId)
    .eq('tenant_id', tenantId)
    .select()
    .single();

  if (error) throw appError(500, 'DB_ERROR', error.message);
  if (!revokedUser) throw appError(404, 'USER_NOT_FOUND', 'Target user missing or tenant mismatch.');

  return {
    status: 'DEPROVISIONED_SUCCESSFULLY',
    access_revoked_immediately: true,
    user: revokedUser
  };
};

/**
 * Stage D: Session Access Validation Middleware check
 */
export const validateActiveSession = async (sessionToken, tenantId) => {
  const { data: user, error } = await supabase
    .from('scim_provisioned_identities')
    .select('*')
    .eq('active_session_token', sessionToken)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (error || !user || user.user_status !== 'active') {
    throw appError(401, 'SESSION_REVOKED', 'User access has been revoked or deprovisioned by enterprise IdP.');
  }

  return user;
};