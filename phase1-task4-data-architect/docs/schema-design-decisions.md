
# Database Design Decisions & Normalization Rationales[cite: 9]

1. **Third Normal Form (3NF) Compliance:**
   * Redundant college, drive, and student details are isolated into dedicated entity tables to eliminate update/deletion anomalies[cite: 9].
   * Job applications connect via foreign keys (`job_id`, `student_id`) instead of duplicating profile state[cite: 9].

2. **Integrity Constraints & Data Protection:**
   * Enforced `CHECK` constraints on GPA ranges (`0.0 <= gpa <= 10.0`), graduation years, and status enums[cite: 9].
   * Enforced composite `UNIQUE (job_id, student_id)` constraint on `applications` to prevent duplicate candidate submissions[cite: 9].

3. **Performance Indexing Strategy:**
   * Added B-Tree composite indexes for frequent query patterns (e.g., querying applications by student and status, or listing students by college and GPA)[cite: 9].