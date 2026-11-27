import { FIELDS } from '../schemas/formSchema.js';

/**
 * Format-level field validation (non-blocking; no fields are forced mandatory).
 * Returns an error message string in Hindi if a filled value has an invalid format,
 * or null if valid / empty.
 */
export function validateFieldFormat(fieldId, value) {
  const field = FIELDS[String(fieldId)];
  if (!field) return null;

  if (value === undefined || value === null || value === '') {
    return null;
  }

  // Email format check when entered
  if (field.type === 'email') {
    const cleaned = String(value).trim();
    if (cleaned.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleaned)) {
      return 'कृपया सही ईमेल पता दर्ज करें।';
    }
  }

  // Mobile number format check when entered
  if (field.type === 'tel') {
    const digits = String(value).replace(/[\s\-+()]/g, '');
    if (digits.length > 0 && (digits.length < 10 || digits.length > 13 || !/^\d+$/.test(digits))) {
      return 'कृपया सही मोबाइल नंबर दर्ज करें (10 अंक)।';
    }
  }

  // Number inputs should not be negative
  if (field.type === 'number') {
    const num = Number(value);
    if (Number.isNaN(num) || (field.min !== undefined && num < field.min)) {
      return `कृपया ${field.min ?? 0} या उससे अधिक की सही संख्या लिखें।`;
    }
  }

  return null;
}

/**
 * Collect all format validation warnings across all fields.
 */
export function validateAllAnswers(answers = {}) {
  const errors = {};
  for (const fieldId of Object.keys(FIELDS)) {
    const err = validateFieldFormat(fieldId, answers[fieldId]);
    if (err) {
      errors[fieldId] = err;
    }
  }
  return errors;
}

/**
 * Soft completeness hints shown on the Final Review screen (advisory only).
 */
export function getReviewAdvisories(answers = {}) {
  const advisories = [];
  if (!answers['1'] || !String(answers['1']).trim()) {
    advisories.push('साथी का पूरा नाम (भाग 1) अभी खाली है।');
  }
  if (!answers['2'] || !String(answers['2']).trim()) {
    advisories.push('जायज़े का महीना (भाग 1) अभी चुना नहीं गया है।');
  }
  return advisories;
}
