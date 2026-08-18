import { query, runTransaction } from '../config/db.js';

export const driveRepository = {
  /**
   * Executes a multi-step ACID transaction: Creates Drive + Job Roles + Audit Trail
   */
  createDriveWithRoles: async (driveData) => {
    return await runTransaction(async (client) => {
      // 1. Insert Placement Drive Record[cite: 10]
      const driveInsertSql = `
        INSERT INTO placement_drives (company_name, drive_title, min_gpa, drive_status)
        VALUES ($1, $2, $3, 'SCHEDULED')
        RETURNING *;
      `;
      const driveResult = await client.query(driveInsertSql, [
        driveData.company_name,
        driveData.drive_title,
        driveData.min_gpa
      ]);
      const drive = driveResult.rows[0];

      // 2. Insert Associated Job Roles[cite: 10]
      const insertedRoles = [];
      const roleInsertSql = `
        INSERT INTO drive_job_roles (drive_id, role_title, openings_count, ctc_lpa)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;

      for (const role of driveData.roles) {
        const roleResult = await client.query(roleInsertSql, [
          drive.id,
          role.role_title,
          role.openings_count,
          role.ctc_lpa
        ]);
        insertedRoles.push(roleResult.rows[0]);
      }

      // 3. Record Audit Trail[cite: 10]
      const auditInsertSql = `
        INSERT INTO drive_audit_trail (drive_id, action, metadata)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      await client.query(auditInsertSql, [
        drive.id,
        'DRIVE_CREATED_TRANSACTION',
        JSON.stringify({ roles_count: insertedRoles.length })
      ]);

      return {
        ...drive,
        roles: insertedRoles
      };
    });
  },

  /**
   * Safe parameterized read query[cite: 10]
   */
  findById: async (driveId) => {
    const driveSql = `SELECT * FROM placement_drives WHERE id = $1;`;
    const rolesSql = `SELECT * FROM drive_job_roles WHERE drive_id = $1;`;

    const driveRes = await query(driveSql, [driveId]);
    if (driveRes.rows.length === 0) return null;

    const rolesRes = await query(rolesSql, [driveId]);

    return {
      ...driveRes.rows[0],
      roles: rolesRes.rows
    };
  },

  /**
   * Safe parameterized update query[cite: 10]
   */
  updateStatus: async (driveId, status) => {
    const updateSql = `
      UPDATE placement_drives
      SET drive_status = $1
      WHERE id = $2
      RETURNING *;
    `;
    const res = await query(updateSql, [status, driveId]);
    return res.rows[0] || null;
  },

  /**
   * Safe parameterized delete query[cite: 10]
   */
  deleteById: async (driveId) => {
    const deleteSql = `DELETE FROM placement_drives WHERE id = $1 RETURNING id;`;
    const res = await query(deleteSql, [driveId]);
    return res.rowCount > 0;
  }
};