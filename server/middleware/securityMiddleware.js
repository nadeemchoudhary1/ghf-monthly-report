/**
 * Recursively strip MongoDB operator keys (`$...` or dotted keys) from user-supplied objects
 * to protect against NoSQL operator injection.
 * Note: Numeric field IDs ("1".."72") are safe plain digits and are preserved.
 */
function stripDangerousKeys(value) {
  if (Array.isArray(value)) {
    return value.map(stripDangerousKeys);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      clean[key] = stripDangerousKeys(val);
    }
    return clean;
  }
  return value;
}

export function sanitizeMongoOperators(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = stripDangerousKeys(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const [k, v] of Object.entries(req.query)) {
      if (k.startsWith('$') || k.includes('.')) {
        delete req.query[k];
      } else if (typeof v === 'object' && v !== null) {
        delete req.query[k];
      }
    }
  }
  return next();
}

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

function isLocalDevNetworkOrigin(origin) {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return true;
    }
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return true;
    }
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return true;
    }
    const m172 = host.match(/^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
    if (m172) {
      const secondOctet = Number(m172[1]);
      return secondOctet >= 16 && secondOctet <= 31;
    }
    return false;
  } catch {
    return false;
  }
}

export function getAllowedOriginsFromEnv() {
  const configured = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
        .map(normalizeOrigin)
        .filter(Boolean)
    : [];

  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim()) {
    const fUrl = normalizeOrigin(process.env.FRONTEND_URL);
    if (fUrl && !configured.includes(fUrl)) {
      configured.push(fUrl);
    }
  }

  if (configured.length > 0) {
    return Array.from(new Set(configured));
  }

  return [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ];
}

export function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;

  const allowed = getAllowedOriginsFromEnv();
  if (allowed.includes(normalized)) {
    return true;
  }

  if (process.env.NODE_ENV !== 'production' && isLocalDevNetworkOrigin(normalized)) {
    return true;
  }

  return false;
}

/**
 * CSRF defense-in-depth for cookie-authenticated state-changing Admin routes.
 * Requires Origin (when present) to match allowed origins AND requires a non-simple
 * request header (`X-Requested-With: XMLHttpRequest` or `application/json` content-type).
 */
export function adminCsrfGuard(req, res, next) {
  const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({
      success: false,
      message: 'CSRF check failed: origin not allowed.',
    });
  }

  const xRequestedWith = req.headers['x-requested-with'];
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  if (xRequestedWith !== 'XMLHttpRequest' && !contentType.includes('application/json')) {
    return res.status(403).json({
      success: false,
      message: 'CSRF check failed: missing required request header.',
    });
  }

  return next();
}
