import { FIELDS, SCHEMA_VERSION, SECTION_9_ID } from '../schemas/formSchema.js';
import { validateAllAnswers } from '../utils/formValidation.js';
import { submitAssessmentRequest } from './api.js';
import {
  enqueuePendingSubmission,
  generateSubmissionId,
  getPendingSubmission,
  loadPendingQueue,
  markPendingRetryFailure,
  prepareManualRetry,
  removePendingSubmission,
} from './submissionQueue.js';

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const inFlightSids = new Set();

/**
 * Build the compact public submission payload (Sections 1–8 only; excludes empty values).
 */
export function buildSubmissionPayload(answers = {}, sid) {
  const compactAnswers = {};
  for (const [fieldId, field] of Object.entries(FIELDS)) {
    if (field.sectionId === SECTION_9_ID) continue;
    const val = answers[fieldId];
    if (val === undefined || val === null || val === '') continue;
    if (Array.isArray(val) && val.length === 0) continue;

    if (field.type === 'number') {
      const num = Number(val);
      if (!Number.isNaN(num)) compactAnswers[fieldId] = num;
    } else if (field.type === 'radio' || field.type === 'rating') {
      compactAnswers[fieldId] = Number(val);
    } else {
      compactAnswers[fieldId] = val;
    }
  }

  return {
    sid,
    sv: SCHEMA_VERSION,
    month: typeof answers['2'] === 'string' ? answers['2'].trim() : '',
    answers: compactAnswers,
  };
}

/**
 * Validate form readiness before creating a submission ID and queueing.
 */
export function validateSubmissionReadiness(answers = {}) {
  const errors = [];
  const month = typeof answers['2'] === 'string' ? answers['2'].trim() : '';

  if (!MONTH_REGEX.test(month)) {
    errors.push('कृपया भाग 1 में जायज़े का महीना चुनें।');
  }

  const formatErrors = validateAllAnswers(answers);
  for (const [id, msg] of Object.entries(formatErrors)) {
    const field = FIELDS[id];
    if (field && field.sectionId !== SECTION_9_ID) {
      errors.push(`${field.label}: ${msg}`);
    }
  }

  const hasAnyAnswer = Object.entries(answers).some(([id, val]) => {
    const field = FIELDS[id];
    if (!field || field.sectionId === SECTION_9_ID) return false;
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null && String(val).trim() !== '';
  });

  if (!hasAnyAnswer) {
    errors.push('सबमिट करने से पहले कम से कम एक जानकारी दर्ज करें।');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

async function sendQueuedItem(item) {
  if (!item || inFlightSids.has(item.sid)) {
    return { ok: false, kind: 'in_flight', sid: item?.sid };
  }

  inFlightSids.add(item.sid);
  try {
    const res = await submitAssessmentRequest(item.payload);

    if (res.ok) {
      removePendingSubmission(item.sid);
      return {
        ok: true,
        kind: 'success',
        status: res.status,
        sid: item.sid,
        month: item.payload.month,
        submittedAnswers: item.payload.answers,
      };
    }

    if (res.kind === 'validation_error') {
      // Permanent validation failure: remove invalid queue entry so it does not auto-loop; draft stays safe.
      removePendingSubmission(item.sid);
      return {
        ok: false,
        kind: 'validation_error',
        sid: item.sid,
        message: res.message,
        errors: res.errors || [],
      };
    }

    // Temporary failure: preserve same SID & payload in queue with exponential backoff
    markPendingRetryFailure(item.sid, res.message);
    return {
      ok: false,
      kind: 'temporary_error',
      sid: item.sid,
      message: res.message,
    };
  } finally {
    inFlightSids.delete(item.sid);
  }
}

/**
 * Validate, generate unique SID, persist to pending queue, and submit to backend.
 */
export async function submitNewAssessment({ answers, draftUpdatedAt = null }) {
  const readiness = validateSubmissionReadiness(answers);
  if (!readiness.valid) {
    return {
      ok: false,
      kind: 'validation_error',
      message: readiness.errors[0],
      errors: readiness.errors,
    };
  }

  const month = String(answers['2']).trim();
  const sid = generateSubmissionId(month);
  const payload = buildSubmissionPayload(answers, sid);

  const entry = enqueuePendingSubmission(payload, draftUpdatedAt);
  return sendQueuedItem(entry);
}

/**
 * Manually retry an existing queued submission using the EXACT SAME SID.
 */
export async function retryPendingSubmission(sid) {
  prepareManualRetry(sid);
  const item = getPendingSubmission(sid);
  if (!item) {
    return {
      ok: false,
      kind: 'not_found',
      message: 'यह लंबित सबमिशन कतार में नहीं मिला।',
    };
  }
  return sendQueuedItem(item);
}

/**
 * Process due pending submissions (on startup, connectivity restore, or backoff timer).
 */
export async function processDuePendingSubmissions({ forceAll = false } = {}) {
  const queue = loadPendingQueue();
  if (queue.length === 0) return [];

  const now = Date.now();
  const dueItems = queue.filter(
    (item) =>
      item.status === 'pending' &&
      (forceAll || !item.nextRetryAt || item.nextRetryAt <= now)
  );

  const results = [];
  for (const item of dueItems) {
    const result = await sendQueuedItem(item);
    results.push(result);
  }
  return results;
}
