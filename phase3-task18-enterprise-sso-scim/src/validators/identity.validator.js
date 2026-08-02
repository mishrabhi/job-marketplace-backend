import { z } from 'zod';

export const configureSSOSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  idp_entity_id: z.string().min(1, { message: "IdP Entity ID required" }),
  sso_login_url: z.string().url({ message: "Valid SSO login URL required" }),
  certificate_fingerprint: z.string().min(1, { message: "Certificate fingerprint required" }),
  protocol: z.enum(['SAML2', 'OIDC']).default('SAML2'),
  allow_break_glass: z.boolean().default(true)
});

export const scimUserProvisionSchema = z.object({
  external_idp_id: z.string().min(1, { message: "External IdP user ID required" }),
  email: z.string().email({ message: "Valid user email address required" }),
  first_name: z.string().min(1),
  last_name: z.string().min(1)
});

export const scimUserDeprovisionSchema = z.object({
  external_idp_id: z.string().min(1, { message: "External IdP user ID required" })
});