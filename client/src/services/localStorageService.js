import {
  ASSESSMENT_MONTH_FIELD_ID,
  FIELDS,
  PUBLIC_SECTIONS,
  SCHEMA_VERSION,
} from '../schemas/formSchema.js';

export const DRAFT_STORAGE_KEY = 'ghf_assessment_draft_v1';

const PERSONAL_INFO_FIELD_IDS = ['1', '2', '3', '4', '5', '6', '7', '72'];

export function createEmptyDraft() {
  return {
    schemaVersion: SCHEMA_VERSION,
    currentSection: 1,
    assessmentMonth: '',
    personalInfo: {},
    answers: {},
    updatedAt: null,
  };
}

/**
 * Extract personal info summary from answers for quick access & Phase 2 payload prep.
 */
export function extractPersonalInfo(answers = {}) {
  const info = {};
  for (const id of PERSONAL_INFO_FIELD_IDS) {
    if (answers[id] !== undefined && answers[id] !== '') {
      info[id] = answers[id];
    }
  }
  return info;
}

/**
 * Sanitize and validate a raw field value against its centralized schema definition.
 */
function sanitizeFieldValue(field, rawValue) {
  if (rawValue === undefined || rawValue === null) return undefined;

  if (field.type === 'checkbox') {
    if (!Array.isArray(rawValue)) return undefined;
    const validCodes = rawValue
      .map((v) => Number(v))
      .filter((code) => Number.isInteger(code) && field.options?.[code] !== undefined);
    return validCodes.length > 0 ? Array.from(new Set(validCodes)) : undefined;
  }

  if (field.type === 'radio' || field.type === 'rating') {
    const code = Number(rawValue);
    if (!Number.isInteger(code) || field.options?.[code] === undefined) {
      return undefined;
    }
    return code;
  }

  if (field.type === 'number') {
    if (rawValue === '') return undefined;
    const str = String(rawValue).trim();
    if (str === '' || Number.isNaN(Number(str))) return undefined;
    return str;
  }

  if (typeof rawValue === 'string') {
    return rawValue;
  }

  return String(rawValue);
}

/**
 * Validate and normalize a parsed draft object before restoring into React state.
 */
export function validateDraftPayload(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, reason: 'Invalid draft structure', data: null };
  }

  // Schema version check (supports migration hooks in future versions)
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    return {
      valid: false,
      reason: `Unsupported schema version: ${String(raw.schemaVersion)}`,
      data: null,
    };
  }

  const maxSection = PUBLIC_SECTIONS.length;
  const parsedSection = Number(raw.currentSection);
  const currentSection =
    Number.isInteger(parsedSection) && parsedSection >= 1 && parsedSection <= maxSection
      ? parsedSection
      : 1;

  const sanitizedAnswers = {};
  const sourceAnswers =
    raw.answers && typeof raw.answers === 'object' && !Array.isArray(raw.answers)
      ? raw.answers
      : {};

  // Merge any personalInfo fallback if answers missed a personal info field
  if (raw.personalInfo && typeof raw.personalInfo === 'object') {
    for (const id of PERSONAL_INFO_FIELD_IDS) {
      if (sourceAnswers[id] === undefined && raw.personalInfo[id] !== undefined) {
        sourceAnswers[id] = raw.personalInfo[id];
      }
    }
  }

  for (const [fieldId, fieldDef] of Object.entries(FIELDS)) {
    const cleanVal = sanitizeFieldValue(fieldDef, sourceAnswers[fieldId]);
    if (cleanVal !== undefined) {
      sanitizedAnswers[fieldId] = cleanVal;
    }
  }

  // Sync assessmentMonth between top-level property and field "2"
  const monthFromAnswers = sanitizedAnswers[ASSESSMENT_MONTH_FIELD_ID] ?? '';
  const topLevelMonth =
    typeof raw.assessmentMonth === 'string' ? raw.assessmentMonth : '';
  const assessmentMonth = monthFromAnswers || topLevelMonth;
  if (assessmentMonth && !sanitizedAnswers[ASSESSMENT_MONTH_FIELD_ID]) {
    sanitizedAnswers[ASSESSMENT_MONTH_FIELD_ID] = assessmentMonth;
  }

  const updatedAt =
    typeof raw.updatedAt === 'string' && !Number.isNaN(Date.parse(raw.updatedAt))
      ? raw.updatedAt
      : null;

  return {
    valid: true,
    reason: null,
    data: {
      schemaVersion: SCHEMA_VERSION,
      currentSection,
      assessmentMonth,
      personalInfo: extractPersonalInfo(sanitizedAnswers),
      answers: sanitizedAnswers,
      updatedAt,
    },
  };
}

export function loadDraft() {
  try {
    const serialized = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!serialized) {
      return { ok: true, found: false, draft: createEmptyDraft(), error: null };
    }
    const parsed = JSON.parse(serialized);
    const validation = validateDraftPayload(parsed);
    if (!validation.valid) {
      return {
        ok: false,
        found: false,
        draft: createEmptyDraft(),
        error: validation.reason,
      };
    }
    return {
      ok: true,
      found: true,
      draft: validation.data,
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      found: false,
      draft: createEmptyDraft(),
      error: err?.message || 'Local Storage पढ़ने में त्रुटि हुई।',
    };
  }
}

export function saveDraft(draft) {
  try {
    const payload = {
      schemaVersion: SCHEMA_VERSION,
      currentSection: draft.currentSection ?? 1,
      assessmentMonth:
        draft.answers?.[ASSESSMENT_MONTH_FIELD_ID] ?? draft.assessmentMonth ?? '',
      personalInfo: extractPersonalInfo(draft.answers),
      answers: draft.answers ?? {},
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    return { ok: true, updatedAt: payload.updatedAt, error: null };
  } catch (err) {
    return {
      ok: false,
      updatedAt: null,
      error: err?.message || 'ब्राउज़र स्टोरेज में सहेजने में त्रुटि हुई।',
    };
  }
}

export function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    return { ok: true, error: null };
  } catch (err) {
    return {
      ok: false,
      error: err?.message || 'ड्राफ्ट साफ़ करने में त्रुटि हुई।',
    };
  }
}

export function hasSavedDraftData(draft) {
  if (!draft || !draft.answers) return false;
  return Object.keys(draft.answers).some((key) => {
    const val = draft.answers[key];
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && String(val).trim() !== '';
  });
}
