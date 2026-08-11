import { z } from 'zod';

export const generateCertificationPackSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  certified_by: z.string().uuid({ message: "Valid certifier UUID required" }),
  slo_status: z.enum(['PASSED', 'FAILED']),
  load_test_passed: z.boolean().default(true),
  security_audit_clear: z.boolean().default(true),
  compliance_verified: z.boolean().default(true),
  dr_restore_proven: z.boolean().default(true),
  finops_target_met: z.boolean().default(true),
  idempotency_key: z.string().min(1, { message: "Idempotency key parameter required" })
});

export const executeCutoverStageSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  stage_name: z.string().min(1, { message: "Stage name string required" }),
  canary_traffic_pct: z.number().int().min(0).max(100),
  simulated_error_rate_pct: z.number().min(0).max(100).default(0.0),
  idempotency_key: z.string().min(1, { message: "Idempotency key required" })
});

export const recordBacklogItemSchema = z.object({
  tenant_id: z.string().uuid({ message: "Valid tenant ID UUID required" }),
  report_type: z.enum(['POST_LAUNCH_HEALTH', 'PHASE_4_BACKLOG']),
  item_title: z.string().min(3),
  severity_priority: z.enum(['P0', 'P1', 'P2', 'P3']),
  details: z.record(z.any()).default({})
});