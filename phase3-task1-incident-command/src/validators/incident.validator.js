import { z } from 'zod';

export const triggerIncidentSchema = z.object({
  title: z.string().min(1),
  severity: z.enum(['SEV_1_CRITICAL', 'SEV_2_MAJOR', 'SEV_3_MINOR']),
  on_call_responder: z.string().uuid(),
  idempotency_key: z.string().min(1)
});

export const reportDefectSchema = z.object({
  error_message: z.string().min(1),
  stack_trace: z.string().min(1),
  impacted_tenant_id: z.string().uuid().optional()
});

export const createBacklogTaskSchema = z.object({
  defect_ref_id: z.string().uuid().optional(),
  task_title: z.string().min(1),
  engineering_owner: z.string().min(1),
  bar_target_metrics: z.string().min(1),
  idempotency_key: z.string().min(1)
});

export const finalizePostmortemSchema = z.object({
  incident_id: z.string().uuid(),
  root_cause: z.string().min(1),
  preventative_actions: z.array(z.string()).min(1)
});