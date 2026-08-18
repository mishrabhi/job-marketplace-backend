import { z } from 'zod';

export const createStudentSchema = {
  body: z.object({
    full_name: z
      .string({ required_error: "Full name is required" })
      .trim()
      .min(2, { message: "Full name must be at least 2 characters long" })
      .max(100, { message: "Full name cannot exceed 100 characters" }),
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .toLowerCase()
      .email({ message: "Invalid email format provided" }),
    gpa: z
      .number({ required_error: "GPA is required", invalid_type_error: "GPA must be a numeric value" })
      .min(0.0, { message: "GPA cannot be negative" })
      .max(10.0, { message: "GPA cannot exceed 10.0" }),
    grad_year: z
      .number({ required_error: "Graduation year is required" })
      .int({ message: "Graduation year must be an integer" })
      .min(2020, { message: "Graduation year cannot be earlier than 2020" })
      .max(2035, { message: "Graduation year cannot exceed 2035" }),
    skills: z
      .array(z.string().trim().min(1, { message: "Skill tag cannot be empty" }))
      .min(1, { message: "At least one skill is required" })
      .max(20, { message: "Cannot submit more than 20 skills" })
  }).strict() // Reject unexpected/malicious properties
};

export const getStudentParamsSchema = {
  params: z.object({
    id: z.string().uuid({ message: "Student ID must be a valid UUID format" })
  })
};

export const listStudentsQuerySchema = {
  query: z.object({
    page: z.string().optional().transform(val => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
    limit: z.string().optional().transform(val => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
    skill: z.string().trim().optional(),
    min_gpa: z.string().optional().transform(val => (val ? parseFloat(val) : undefined))
  })
};