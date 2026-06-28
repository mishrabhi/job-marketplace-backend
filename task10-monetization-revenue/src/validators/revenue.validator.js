import z from ('zod');

export default revenueDashboardQuerySchema = z.object({
  startDate: z.string().datetime({ message: "Invalid ISO 8601 Date string format" }).optional(),
  endDate: z.string().datetime({ message: "Invalid ISO 8601 Date string format" }).optional()
});

export default reconciliationQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" }).optional()
});

