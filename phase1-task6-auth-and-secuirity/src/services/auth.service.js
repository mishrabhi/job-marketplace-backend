import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { appError } from '../middlewares/errorHandler.js';
import { logger } from '../config/logger.js';

export const registerUser = async (userData) => {
  const { email, password, full_name, role } = userData;

  logger.info(`Registering new user account: ${email}`);

  // Hash password using bcrypt
  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const insertSql = `
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, full_name, role, is_active, created_at;
  `;

  const result = await query(insertSql, [email.toLowerCase(), passwordHash, full_name, role]);
  return result.rows[0];
};

export const loginUser = async (loginData) => {
  const { email, password } = loginData;

  logger.info(`Login attempt for user: ${email}`);

  const userSql = `SELECT * FROM users WHERE email = $1;`;
  const result = await query(userSql, [email.toLowerCase()]);
  const user = result.rows[0];

  if (!user) {
    throw appError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  if (!user.is_active) {
    throw appError(403, 'ACCOUNT_DEACTIVATED', 'This user account has been disabled.');
  }

  // Compare password hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw appError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
  }

  // Sign JSON Web Token with expiration
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: env.JWT_EXPIRES_IN
  };
};

export const getUserProfile = async (userId) => {
  const sql = `SELECT id, email, full_name, role, is_active, created_at FROM users WHERE id = $1;`;
  const result = await query(sql, [userId]);
  const user = result.rows[0];

  if (!user) {
    throw appError(404, 'USER_NOT_FOUND', 'User profile not found.');
  }

  return user;
};