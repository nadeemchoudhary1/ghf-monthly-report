import {
  SCHEMA_VERSION,
  validateAndCompactAnswers,
} from '../utils/answerMapper.js';

const ALLOWED_ROOT_KEYS = new Set(['sid', 'sv', 'month', 'answers']);
const SID_REGEX = /^[A-Za-z0-9_-]{8,64}$/;
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Strictly validate public submission payloads before touching MongoDB.
 */
export function validateSubmissionPayload(req, res, next) {
  const body = req.body;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      message: 'Request body must be a valid JSON object.',
      errors: ['Invalid JSON payload.'],
    });
  }

  // Reject unexpected top-level properties (e.g., attempts to inject rs, rv, _id)
  const unexpectedKeys = Object.keys(body).filter((k) => !ALLOWED_ROOT_KEYS.has(k));
  if (unexpectedKeys.length > 0) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      message: 'Unexpected properties in submission payload.',
      errors: unexpectedKeys.map((k) => `Unexpected property: "${k}".`),
    });
  }

  const errors = [];

  // 1. Validate Submission ID (sid)
  const sid = typeof body.sid === 'string' ? body.sid.trim() : '';
  if (!SID_REGEX.test(sid)) {
    errors.push('Invalid or missing Submission ID (sid).');
  }

  // 2. Validate Schema Version (sv)
  const sv = Number(body.sv);
  if (!Number.isInteger(sv) || sv !== SCHEMA_VERSION) {
    errors.push(`Unsupported or invalid schema version (expected ${SCHEMA_VERSION}).`);
  }

  // 3. Validate Assessment Month (month)
  const month = typeof body.month === 'string' ? body.month.trim() : '';
  if (!MONTH_REGEX.test(month)) {
    errors.push('Invalid or missing assessment month (expected YYYY-MM).');
  }

  // 4. Validate and compact answers against centralized schema
  const answerCheck = validateAndCompactAnswers(body.answers, {
    allowResponsibleFields: false,
    expectedMonth: MONTH_REGEX.test(month) ? month : null,
  });

  if (!answerCheck.valid) {
    errors.push(...answerCheck.errors);
  } else if (Object.keys(answerCheck.compact).length === 0) {
    errors.push('Submission must include at least one answered field.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      status: 'validation_error',
      message: errors[0],
      errors,
    });
  }

  req.validatedSubmission = {
    sid,
    sv,
    month,
    a: answerCheck.compact,
  };

  return next();
}
