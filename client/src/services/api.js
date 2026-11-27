const DEFAULT_TIMEOUT_MS = 45000;

export function getApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return String(configured).replace(/\/+$/, '');
}

/**
 * Submit an assessment payload to POST /api/submissions.
 * Uses a 45-second timeout to handle Render Free Tier cold starts safely.
 */
export async function submitAssessmentRequest(payload, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (
      response.ok &&
      data?.success === true &&
      (data?.status === 'submitted' || data?.status === 'already_submitted') &&
      data?.sid === payload.sid
    ) {
      return {
        ok: true,
        kind: 'success',
        status: data.status,
        sid: data.sid,
      };
    }

    if (
      response.status === 400 ||
      response.status === 413 ||
      response.status === 422 ||
      data?.status === 'validation_error'
    ) {
      return {
        ok: false,
        kind: 'validation_error',
        httpStatus: response.status,
        message: data?.message || 'फ़ॉर्म डेटा मान्य नहीं है। कृपया उत्तर जांचें।',
        errors: Array.isArray(data?.errors) ? data.errors : [],
      };
    }

    return {
      ok: false,
      kind: 'temporary_error',
      httpStatus: response.status,
      message: data?.message || 'सर्वर अस्थायी रूप से उपलब्ध नहीं है। पुनः प्रयास किया जाएगा।',
    };
  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return {
      ok: false,
      kind: 'temporary_error',
      httpStatus: 0,
      message: isAbort
        ? 'सर्वर कोल्ड-स्टार्ट के कारण समय सीमा समाप्त हुई। आपका डेटा सुरक्षित है — पुनः प्रयास करें।'
        : 'इंटरनेट या सर्वर से संपर्क नहीं हो सका। आपका डेटा ब्राउज़र में सुरक्षित है।',
    };
  } finally {
    clearTimeout(timerId);
  }
}

/**
 * Lightweight health check (used for background warm-up or status inspection).
 */
export async function checkHealthRequest({ timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);
    return {
      ok: response.ok && data?.success === true,
      server: data?.server || 'unknown',
      database: data?.database || 'unknown',
    };
  } catch {
    return { ok: false, server: 'unreachable', database: 'unknown' };
  } finally {
    clearTimeout(timerId);
  }
}
