import { z } from 'zod';

export const updateStatusSchema = z.object({
  application_id: z.string().uuid({ message: "Valid application identifier UUID required" }),
  new_status: z.enum(['pending_payment', 'applied', 'shortlisted', 'interview_scheduled', 'offer_generated', 'signed', 'rejected', 'withdrawn'], {
    errorMap: () => ({ message: "Must match standard platform lifecycle parameters" })
  }),
  changed_by: z.string().uuid({ message: "Valid operator ID context required" }),
  reason_note: z.string().max(500, { message: "Reason note cannot exceed 500 characters" }).optional()
});

export const getTimelineSchema = z.object({
  application_id: z.string().uuid({ message: "Valid application lookup UUID parameters required" })
});