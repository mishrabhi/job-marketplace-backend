import { logger } from '../config/logger.js';

const mockDriveStore = [
  { id: "drive_001", company: "Google India", title: "Campus Hiring 2026", min_gpa: 8.5, status: "ACTIVE", openings: 25 },
  { id: "drive_002", company: "Microsoft", title: "SWE Placement Drive", min_gpa: 8.0, status: "ACTIVE", openings: 40 },
  { id: "drive_003", company: "Amazon", title: "SDE-1 Campus Drive", min_gpa: 7.5, status: "ACTIVE", openings: 50 }
];

export const driveRepository = {
  // Heavy query simulating DB indexing, aggregation, and disk I/O[cite: 17]
  findHotDrivesFromDB: async () => {
    logger.info('🐢 [DATABASE] Executing heavy SQL query for hot placement drives...');
    await new Promise(resolve => setTimeout(resolve, 350)); // Simulate 350ms DB query[cite: 17]
    return [...mockDriveStore];
  },

  findDriveByIdFromDB: async (driveId) => {
    logger.info(`🐢 [DATABASE] Executing SQL query for drive ID: ${driveId}`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate 200ms DB query[cite: 17]
    return mockDriveStore.find(d => d.id === driveId) || null;
  },

  updateDriveStatusInDB: async (driveId, newStatus) => {
    const drive = mockDriveStore.find(d => d.id === driveId);
    if (drive) {
      drive.status = newStatus;
      return drive;
    }
    return null;
  }
};