import { z } from 'zod';

export const createDriveSchema = z.object({
  company_name: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  drive_title: z.string().min(3, { message: "Drive title is required" }),
  min_gpa: z.number().min(0.0).max(10.0, { message: "Minimum GPA must be between 0.0 and 10.0" }),
  roles: z.array(z.object({
    role_title: z.string().min(2, { message: "Role title required" }),
    openings_count: z.number().int().positive({ message: "Openings must be a positive integer" }),
    ctc_lpa: z.number().positive({ message: "CTC LPA must be positive" })
  })).min(1, { message: "At least one job role is required in the placement drive" })
});

export const updateDriveStatusSchema = z.object({
  drive_status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'], {
    message: "Invalid drive status option"
  })
});