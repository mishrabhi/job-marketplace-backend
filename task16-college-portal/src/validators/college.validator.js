import { z } from 'zod';

export const collegeReportQuerySchema = z.object({
  college_id: z.string().uuid({ message: "Valid college_id UUID context identifier required" }),
  requesting_user_id: z.string().uuid({ message: "Valid user identity context validation token required" })
});

export const provisionAdminSchema = z.object({
  college_id: z.string().uuid({ message: "Valid target institution UUID required" }),
  user_identity_id: z.string().uuid({ message: "Valid identity target credential mapping required" }),
  role_title: z.enum(['placement_officer', 'college_director'], {
    errorMap: () => ({ message: "Role must match authorized platform directory definitions" })
  })
});