import crypto from 'crypto';

const REDACTED_KEYS = new Set([
  'password',
  'passwordHash',
  'currentPassword',
  'newPassword',
  'token',
  'jwt',
  'authorization',
  'cookie',
  'smtp_password',
  'resend_api_key',
  'google_private_key',
  'mongodb_uri',
  'answers',
  'a',
  'rv',
]);

function redactObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactObject);
  const out = {};
  for (const [key, val] of Object.entries(obj)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      out[key] = '[REDACTED]';
    } else if (val && typeof val === 'object') {
      out[key] = redactObject(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}

export function logEvent(level, event, meta = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...redactObject(meta),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export function attachRequestContext(req, res, next) {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startedAt = Date.now();
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      logEvent(res.statusCode >= 500 ? 'error' : 'warn', 'http_error_response', {
        requestId,
        method: req.method,
        path: req.originalUrl?.split('?')[0],
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    }
  });

  next();
}
