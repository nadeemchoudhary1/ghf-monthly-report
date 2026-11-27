import bcrypt from 'bcryptjs';
import { isDatabaseConnected } from '../config/database.js';
import Admin from '../models/Admin.js';

const BCRYPT_ROUNDS = 12;

/**
 * Create the initial administrator in MongoDB if the admins collection is empty
 * and ADMIN_PASSWORD is provided via environment variables.
 */
export async function ensureInitialAdmin({
  username = process.env.ADMIN_USERNAME || 'admin',
  email = process.env.ADMIN_EMAIL || 'admin@ghf.org',
  password = process.env.ADMIN_PASSWORD,
  name = process.env.ADMIN_NAME || 'GHF Administrator',
} = {}) {
  if (!isDatabaseConnected()) {
    return { created: false, reason: 'database_disconnected' };
  }

  const count = await Admin.countDocuments();
  if (count > 0) {
    return { created: false, reason: 'already_initialized' };
  }

  if (!password || String(password).length < 8) {
    return { created: false, reason: 'missing_or_weak_admin_password' };
  }

  const passwordHash = await bcrypt.hash(String(password), BCRYPT_ROUNDS);
  const admin = await Admin.create({
    username: String(username).trim().toLowerCase(),
    email: String(email).trim().toLowerCase(),
    passwordHash,
    name: String(name).trim(),
    role: 'admin',
  });

  console.info(`[AUTH] Initial administrator initialized (${admin.username}).`);
  return { created: true, username: admin.username, email: admin.email };
}
