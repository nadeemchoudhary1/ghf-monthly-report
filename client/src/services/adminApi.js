import { getApiBaseUrl } from './api.js';

async function adminFetch(path, { method = 'GET', body, timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      credentials: 'include',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const err = new Error(data?.message || `Request failed (${response.status})`);
      err.status = response.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err) {
    if (err?.name === 'AbortError') {
      const timeoutErr = new Error('सर्वर से प्रतिक्रिया मिलने में समय लग रहा है। कृपया पुनः प्रयास करें।');
      timeoutErr.status = 408;
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timerId);
  }
}

export function adminLoginRequest({ identifier, password }) {
  return adminFetch('/api/admin/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
}

export function adminLogoutRequest() {
  return adminFetch('/api/admin/auth/logout', { method: 'POST' });
}

export function adminMeRequest() {
  return adminFetch('/api/admin/auth/me');
}

export function adminChangePasswordRequest({ currentPassword, newPassword }) {
  return adminFetch('/api/admin/auth/change-password', {
    method: 'POST',
    body: { currentPassword, newPassword },
  });
}

export function fetchAdminDashboardRequest({ page = 1, limit = 10 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return adminFetch(`/api/admin/dashboard?${params.toString()}`);
}

export function fetchAdminSubmissionsRequest({
  page = 1,
  limit = 10,
  q = '',
  month = '',
  city = '',
  rs = '',
  sort = 'newest',
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
  });
  if (q) params.set('q', q);
  if (month) params.set('month', month);
  if (city) params.set('city', city);
  if (rs !== '' && rs !== undefined && rs !== null) params.set('rs', String(rs));
  return adminFetch(`/api/admin/submissions?${params.toString()}`);
}

export function fetchAdminSubmissionDetailRequest(sid) {
  return adminFetch(`/api/admin/submissions/${encodeURIComponent(sid)}`);
}

export function saveAdminReviewRequest(sid, { rs, rv }) {
  return adminFetch(`/api/admin/submissions/${encodeURIComponent(sid)}/review`, {
    method: 'PATCH',
    body: { rs, rv },
  });
}

export function fetchIntegrationsStatusRequest() {
  return adminFetch('/api/admin/integrations/status');
}

export function fetchAdminSystemHealthRequest() {
  return adminFetch('/api/admin/system-health');
}

export function testEmailIntegrationRequest({ sendTestMessage = false } = {}) {
  return adminFetch('/api/admin/integrations/test-email', {
    method: 'POST',
    body: { sendTestMessage },
  });
}

export function testSheetsIntegrationRequest() {
  return adminFetch('/api/admin/integrations/test-sheets', {
    method: 'POST',
  });
}

export function retryAllFailedEmailsRequest() {
  return adminFetch('/api/admin/integrations/retry-failed-email', {
    method: 'POST',
  });
}

export function retryAllFailedSheetsRequest() {
  return adminFetch('/api/admin/integrations/retry-failed-sheets', {
    method: 'POST',
  });
}

export function retrySubmissionEmailsRequest(sid) {
  return adminFetch(`/api/admin/email/retry/${encodeURIComponent(sid)}`, {
    method: 'POST',
  });
}

export function retrySubmissionSheetsRequest(sid) {
  return adminFetch(`/api/admin/sync/retry/${encodeURIComponent(sid)}`, {
    method: 'POST',
  });
}

export async function downloadExportFile({
  format = 'csv',
  month = '',
  city = '',
  rs = '',
  from = '',
  to = '',
} = {}) {
  const params = new URLSearchParams({ format });
  if (month) params.set('month', month);
  if (city) params.set('city', city);
  if (rs !== '' && rs !== undefined && rs !== null) params.set('rs', String(rs));
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  const response = await fetch(
    `${getApiBaseUrl()}/api/admin/export?${params.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'एक्सपोर्ट फ़ाइल डाउनलोड करने में त्रुटि हुई।');
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] || `ghf-assessments.${format}`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return { filename };
}
