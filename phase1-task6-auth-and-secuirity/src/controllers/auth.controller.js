import * as authService from '../services/auth.service.js';
import { registerUserSchema, loginUserSchema } from '../validators/auth.validator.js';

export const handleRegister = async (req, res, next) => {
  try {
    const validatedBody = registerUserSchema.parse(req.body);
    const user = await authService.registerUser(validatedBody);
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const handleLogin = async (req, res, next) => {
  try {
    const validatedBody = loginUserSchema.parse(req.body);
    const authData = await authService.loginUser(validatedBody);
    return res.status(200).json({ success: true, data: authData });
  } catch (err) {
    next(err);
  }
};

export const handleGetMe = async (req, res, next) => {
  try {
    const profile = await authService.getUserProfile(req.user.userId);
    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const handleAdminDashboard = async (req, res, next) => {
  return res.status(200).json({
    success: true,
    data: {
      message: 'Welcome to TPO Admin Restricted Console',
      accessed_by: req.user
    }
  });
};