import jwt from 'jsonwebtoken';
import { isDatabaseConnected } from '../config/database.js';
import Admin from '../models/Admin.js';

export const ADMIN_COOKIE_NAME = 'ghf_admin_token';

export function getJwtSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length >= 16) {
    return process.env.JWT_SECRET.trim();
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
  }
  return 'ghf_dev_only_fallback_secret_change_in_prod';
}

/**
 * Server-side JWT verification middleware using HTTP-only cookies.
 * Protects all /api/admin/* endpoints against direct unauthorized API calls.
 */
export async function requireAdminAuth(req, res, next) {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database unavailable.',
      });
    }

    const token = req.cookies?.[ADMIN_COOKIE_NAME];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    if (!decoded?.sub) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    const admin = await Admin.findById(decoded.sub)
      .select('_id username email name role')
      .lean();

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Administrator account not found.',
      });
    }

    req.admin = {
      id: String(admin._id),
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    return next();
  } catch (err) {
    if (err?.name === 'TokenExpiredError' || err?.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please log in again.',
      });
    }
    console.error('[AUTH] Middleware error:', err?.message || 'Unknown error');
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failed.',
    });
  }
}
