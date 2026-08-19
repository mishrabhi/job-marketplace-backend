import { pool } from '../src/config/db.js';
import { logger } from '../src/config/logger.js';

export const runSeed = async () => {
  const client = await pool.connect();
  try {
    logger.info('🌱 Starting realistic relationship database seeding...');
    await client.query('BEGIN');

    // 1. Clean previous data
    await client.query('TRUNCATE applications, jobs, students, companies CASCADE;');

    // 2. Seed Companies
    const companyRes = await client.query(`
      INSERT INTO companies (name, industry, website)
      VALUES 
        ('Microsoft India', 'Software Engineering', 'https://microsoft.com'),
        ('Google India', 'Cloud & AI', 'https://google.com'),
        ('Atlassian', 'Developer Productivity', 'https://atlassian.com')
      RETURNING id, name;
    `);
    const [msft, google, atlassian] = companyRes.rows;

    // 3. Seed Connected Jobs
    const jobRes = await client.query(`
      INSERT INTO jobs (company_id, title, min_gpa, salary_lpa, status)
      VALUES 
        ('${msft.id}', 'SDE I - Backend', 7.5, 24.0, 'OPEN'),
        ('${msft.id}', 'Cloud Solutions Architect', 8.0, 28.0, 'OPEN'),
        ('${google.id}', 'Software Engineer - AI Tools', 8.5, 32.0, 'OPEN'),
        ('${atlassian.id}', 'Associate Product Manager', 7.0, 20.0, 'OPEN')
      RETURNING id, title;
    `);
    const [sdeMsft, cloudMsft, sdeGoogle, apmAtlassian] = jobRes.rows;

    // 4. Seed Students
    const studentRes = await client.query(`
      INSERT INTO students (full_name, email, gpa, grad_year)
      VALUES 
        ('Aarav Sharma', 'aarav.sharma@university.edu', 8.9, 2026),
        ('Priya Patel', 'priya.patel@university.edu', 9.2, 2026),
        ('Rohan Varma', 'rohan.varma@university.edu', 7.4, 2026),
        ('Ananya Iyer', 'ananya.iyer@university.edu', 8.1, 2026)
      RETURNING id, full_name;
    `);
    const [aarav, priya, rohan, ananya] = studentRes.rows;

    // 5. Seed Applications (Connecting Students to Jobs)
    await client.query(`
      INSERT INTO applications (job_id, student_id, status)
      VALUES 
        ('${sdeMsft.id}', '${aarav.id}', 'SHORTLISTED'),
        ('${cloudMsft.id}', '${priya.id}', 'OFFERED'),
        ('${sdeGoogle.id}', '${priya.id}', 'APPLIED'),
        ('${apmAtlassian.id}', '${ananya.id}', 'APPLIED'),
        ('${sdeMsft.id}', '${ananya.id}', 'REJECTED');
    `);

    await client.query('COMMIT');
    logger.info('✅ Database seeded successfully with connected relationships!');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Seeding failed, transaction rolled back:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

runSeed();