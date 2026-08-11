import { z } from 'zod';

export const createSnapshotSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  snapshot_identifier: z.string().min(3, { message: "Snapshot identifier string required" }),
  snapshot_type: z.enum(['FULL', 'INCREMENTAL']).default('FULL'),
  storage_location: z.string().min(5, { message: "Storage location URI required" }),
  size_bytes: z.number().int().positive({ message: "Size bytes must be positive integer" })
});

export const executeRestoreSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  snapshot_id: z.string().uuid({ message: "Valid snapshot UUID required" }),
  target_environment: z.string().default('dr_sandbox'),
  executed_by: z.string().uuid({ message: "Valid admin executor UUID required" }),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const logChaosSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  scenario_type: z.enum(['DB_FAILOVER', 'REGION_OUTAGE', 'NETWORK_PARTITION', 'DEPENDENCY_TIMEOUT']),
  degraded_component: z.string().min(2),
  fallback_engaged: z.string().min(2),
  recovery_time_ms: z.number().int().nonnegative(),
  idempotency_key: z.string().min(1, { message: "Idempotency key required" })
});