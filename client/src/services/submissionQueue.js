export const PENDING_QUEUE_KEY = 'ghf_pending_submissions_v1';

const BASE_RETRY_DELAY_MS = 5000;
const MAX_RETRY_DELAY_MS = 300000; // 5 minutes max backoff

export function getBackoffDelayMs(retryCount = 0) {
  const exponent = Math.min(Math.max(0, retryCount), 6);
  return Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * Math.pow(2, exponent));
}

/**
 * Generate a unique collision-resistant Submission ID (e.g. GHF-202611-8F3A2C91).
 */
export function generateSubmissionId(month = '') {
  const monthToken = /^\d{4}-\d{2}$/.test(month)
    ? month.replace('-', '')
    : new Date().toISOString().slice(0, 7).replace('-', '');

  let randomHex = '';
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    randomHex = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    randomHex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  } else {
    randomHex = Math.random().toString(16).slice(2, 10).toUpperCase();
  }

  return `GHF-${monthToken}-${randomHex}`;
}

function isValidQueueItem(item) {
  return (
    item &&
    typeof item === 'object' &&
    typeof item.sid === 'string' &&
    item.sid.length >= 8 &&
    item.payload &&
    typeof item.payload === 'object' &&
    item.payload.sid === item.sid
  );
}

export function loadPendingQueue() {
  try {
    const raw = window.localStorage.getItem(PENDING_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidQueueItem);
  } catch {
    return [];
  }
}

function savePendingQueue(queue) {
  try {
    if (!queue || queue.length === 0) {
      window.localStorage.removeItem(PENDING_QUEUE_KEY);
    } else {
      window.localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Append a new pending submission without overwriting existing queued items.
 */
export function enqueuePendingSubmission(payload, draftUpdatedAt = null) {
  const queue = loadPendingQueue();
  const existing = queue.find((item) => item.sid === payload.sid);
  if (existing) {
    return existing;
  }

  const entry = {
    sid: payload.sid,
    payload,
    draftUpdatedAt,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
    nextRetryAt: Date.now(),
    lastAttemptAt: null,
    lastError: null,
    status: 'pending',
  };

  queue.push(entry);
  savePendingQueue(queue);
  return entry;
}

export function getPendingSubmission(sid) {
  return loadPendingQueue().find((item) => item.sid === sid) || null;
}

export function removePendingSubmission(sid) {
  const queue = loadPendingQueue();
  const next = queue.filter((item) => item.sid !== sid);
  savePendingQueue(next);
  return next;
}

export function markPendingRetryFailure(sid, errorMessage) {
  const queue = loadPendingQueue();
  const now = Date.now();
  const next = queue.map((item) => {
    if (item.sid !== sid) return item;
    const nextRetryCount = (item.retryCount || 0) + 1;
    return {
      ...item,
      status: 'pending',
      retryCount: nextRetryCount,
      lastAttemptAt: new Date(now).toISOString(),
      nextRetryAt: now + getBackoffDelayMs(nextRetryCount),
      lastError: errorMessage || 'अस्थायी सबमिशन त्रुटि',
    };
  });
  savePendingQueue(next);
  return next;
}

export function prepareManualRetry(sid) {
  const queue = loadPendingQueue();
  const now = Date.now();
  const next = queue.map((item) =>
    item.sid === sid ? { ...item, status: 'pending', nextRetryAt: now } : item
  );
  savePendingQueue(next);
  return next;
}
