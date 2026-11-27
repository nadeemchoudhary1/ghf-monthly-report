import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isDatabaseConnected } from '../config/database.js';
import { ADMIN_COOKIE_NAME, getJwtSecret } from '../middleware/authMiddleware.js';
import Admin from '../models/Admin.js';
import { logEvent } from '../utils/logger.js';

const BCRYPT_ROUNDS = 12;
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
// Pre-computed dummy hash for constant-time check when username/email does not exist
const DUMMY_BCRYPT_HASH = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8lQ4P6n3p5aF6pB8h8j9z7xW6t5k4G';

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

export async function loginAdmin(req, res) {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable.',
      });
    }

    const identifier =
      typeof req.body?.identifier === 'string'
        ? req.body.identifier.trim().toLowerCase()
        : '';
    const password =
      typeof req.body?.password === 'string' ? req.body.password : '';

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required.',
      });
    }

    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!admin) {
      await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
      logEvent('warn', 'admin_login_failed', {
        requestId: req.requestId,
        reason: 'invalid_credentials',
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
      });
    }

    const matches = await bcrypt.compare(password, admin.passwordHash);
    if (!matches) {
      logEvent('warn', 'admin_login_failed', {
        requestId: req.requestId,
        reason: 'invalid_credentials',
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
      });
    }

    const token = jwt.sign(
      { sub: String(admin._id), role: admin.role },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie(ADMIN_COOKIE_NAME, token, getCookieOptions());
    logEvent('info', 'admin_login_success', {
      requestId: req.requestId,
      username: admin.username,
    });

    return res.status(200).json({
      success: true,
      admin: {
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Login failed due to a server error.',
    });
  }
}

export function logoutAdmin(_req, res) {
  const opts = getCookieOptions();
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export function getCurrentAdmin(req, res) {
  return res.status(200).json({
    success: true,
    admin: {
      username: req.admin.username,
      email: req.admin.email,
      name: req.admin.name,
      role: req.admin.role,
    },
  });
}

export async function changeAdminPassword(req, res) {
  try {
    const currentPassword =
      typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword =
      typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'New password must be between 8 and 128 characters.',
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password.',
      });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator account not found.',
      });
    }

    const validCurrent = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!validCurrent) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    console.error('[AUTH] Change password error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.',
    });
  }
}
