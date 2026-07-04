import { z } from 'zod';

export const collegeDashboardSchema = z.object({
  college_id: z.string().uuid({ message: "Valid college_id UUID format required" }),
  requesting_user_id: z.string().uuid({ message: "Valid user identity validation token required" })
});