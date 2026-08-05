import { z } from 'zod';

export const logStrideThreatSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  surface_name: z.string().min(1, { message: "Surface name identifier required" }),
  stride_category: z.enum(['SPOOFING', 'TAMPERING', 'REPUDIATION', 'INFO_DISCLOSURE', 'DENIAL_OF_SERVICE', 'ELEVATION_OF_PRIVILEGE']),
  vulnerability_title: z.string().min(3),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  mitigation_details: z.string().min(5),
  idempotency_key: z.string().min(1)
});

export const testIdorDefenseSchema = z.object({
  requesting_tenant_id: z.string().uuid({ message: "Valid requesting tenant ID UUID required" }),
  target_resource_id: z.string().uuid({ message: "Valid target resource ID UUID required" }),
  resource_owner_tenant_id: z.string().uuid({ message: "Valid owner tenant ID UUID required" })
});

export const auditSupplyChainSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  package_manifest: z.array(z.object({
    package_name: z.string().min(1),
    installed_version: z.string().min(1)
  })).min(1)
});