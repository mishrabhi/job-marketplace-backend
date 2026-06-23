import Job from '../models/Job.js';
import SkillThreshold from '../models/SkillThreshold.js';
import { query } from '../config/db.js';

export default class ThresholdService {
  static async checkStudentEligibility(studentId, jobId) {
    const job = await Job.findById(jobId);
    if (!job) {
      const error = new Error('Job not found');
      error.status = 404;
      error.code = 'JOB_NOT_FOUND';
      throw error;
    }

    if (job.status !== 'published') {
      return {
        eligible: false,
        failures: [
          {
            reason: 'JOB_NOT_PUBLISHED',
            message: 'Job is not published for applications'
          }
        ]
      };
    }

    const studentResult = await query(
      `SELECT skill_scores FROM students WHERE id = $1`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      const error = new Error('Student not found');
      error.status = 404;
      error.code = 'STUDENT_NOT_FOUND';
      throw error;
    }

    const skillScores = studentResult.rows[0].skill_scores || {};
    const thresholds = await SkillThreshold.findByJobId(jobId);

    if (thresholds.length === 0) {
      return { eligible: true, failures: [] };
    }

    const failures = [];

    for (const threshold of thresholds) {
      const studentScore = skillScores[threshold.skill_id] || 0;
      if (studentScore < threshold.min_level) {
        failures.push({
          skill_id: threshold.skill_id,
          reason: 'THRESHOLD_NOT_MET',
          message: `Student skill level ${studentScore} is below required level ${threshold.min_level}`,
          student_level: studentScore,
          required_level: threshold.min_level
        });
      }
    }

    return {
      eligible: failures.length === 0,
      failures
    };
  }
}
