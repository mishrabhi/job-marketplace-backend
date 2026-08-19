import { query } from '../config/db.js';

export const relationshipRepository = {
  /**
   * Anti-N+1 Query: Fetches companies, their jobs, and applications in a single JOIN + json_agg query
   */
  getCompaniesWithNestedJobs: async () => {
    const sql = `
      SELECT 
        c.id AS company_id,
        c.name AS company_name,
        c.industry,
        COALESCE(
          json_agg(
            json_build_object(
              'job_id', j.id,
              'title', j.title,
              'salary_lpa', j.salary_lpa,
              'status', j.status,
              'applications_count', (
                SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id
              )
            )
          ) FILTER (WHERE j.id IS NOT NULL),
          '[]'
        ) AS jobs
      FROM companies c
      LEFT JOIN jobs j ON j.company_id = c.id
      GROUP BY c.id, c.name, c.industry
      ORDER BY c.name ASC;
    `;
    const result = await query(sql);
    return result.rows;
  },

  /**
   * Anti-N+1 Query: Fetches a single job with all student candidate profiles in a single query[cite: 13]
   */
  getJobWithApplicants: async (jobId) => {
    const sql = `
      SELECT 
        j.id AS job_id,
        j.title,
        j.min_gpa,
        j.salary_lpa,
        c.name AS company_name,
        COALESCE(
          json_agg(
            json_build_object(
              'application_id', a.id,
              'status', a.status,
              'applied_at', a.applied_at,
              'student_id', s.id,
              'student_name', s.full_name,
              'email', s.email,
              'gpa', s.gpa
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'
        ) AS applicants
      FROM jobs j
      JOIN companies c ON c.id = j.company_id
      LEFT JOIN applications a ON a.job_id = j.id
      LEFT JOIN students s ON s.id = a.student_id
      WHERE j.id = $1
      GROUP BY j.id, c.name;
    `;
    const result = await query(sql, [jobId]);
    return result.rows[0] || null;
  },

  /**
   * Tests Cascade Delete on Job (should automatically remove child applications)[cite: 13]
   */
  deleteJobCascade: async (jobId) => {
    const sql = `DELETE FROM jobs WHERE id = $1 RETURNING id;`;
    const result = await query(sql, [jobId]);
    return result.rowCount > 0;
  },

  /**
   * Tests Restrict Constraint on Company[cite: 13]
   */
  deleteCompanyRestrict: async (companyId) => {
    const sql = `DELETE FROM companies WHERE id = $1 RETURNING id;`;
    const result = await query(sql, [companyId]);
    return result.rowCount > 0;
  }
};