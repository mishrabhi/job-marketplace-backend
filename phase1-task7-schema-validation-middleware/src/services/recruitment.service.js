import { logger } from '../config/logger.js';

// In-memory data store for verification
const studentStore = [];
const driveStore = [];

export const createStudent = async (sanitizedStudentData) => {
  logger.info(`Persisting sanitized student: ${sanitizedStudentData.email}`);
  
  const student = {
    id: `550e8400-e29b-41d4-a716-${Date.now().toString().slice(-12)}`,
    ...sanitizedStudentData,
    created_at: new Date().toISOString()
  };

  studentStore.push(student);
  return student;
};

export const findStudentById = async (studentId) => {
  const student = studentStore.find(s => s.id === studentId);
  return student || {
    id: studentId,
    full_name: "Mock Student",
    email: "mock.student@university.edu",
    gpa: 8.5,
    grad_year: 2026,
    skills: ["Node.js", "Express", "Zod"]
  };
};

export const createPlacementDrive = async (sanitizedDriveData) => {
  logger.info(`Persisting sanitized placement drive: ${sanitizedDriveData.drive_title}`);

  const drive = {
    id: `660e8400-e29b-41d4-a716-${Date.now().toString().slice(-12)}`,
    ...sanitizedDriveData,
    status: 'SCHEDULED',
    created_at: new Date().toISOString()
  };

  driveStore.push(drive);
  return drive;
};