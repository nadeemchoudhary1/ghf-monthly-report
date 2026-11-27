let customSenderOverride = null;

/**
 * Allow test suites to inject a deterministic email transport without modifying production code.
 */
export function setEmailSenderOverride(fn) {
  customSenderOverride = fn;
}

export function getEmailConfigSummary() {
  const apiKeyConfigured = Boolean(
    process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()
  );
  const fromConfigured = Boolean(
    process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()
  );
  const adminEmailConfigured = Boolean(
    process.env.GHF_ADMIN_EMAIL && process.env.GHF_ADMIN_EMAIL.trim()
  );

  return {
    configured: apiKeyConfigured && fromConfigured,
    provider: apiKeyConfigured ? 'resend' : 'unconfigured',
    fromConfigured,
    adminEmailConfigured,
  };
}

export async function sendEmail({ to, subject, html, idempotencyKey }) {
  if (customSenderOverride) {
    return customSenderOverride({ to, subject, html, idempotencyKey });
  }

  const summary = getEmailConfigSummary();
  if (!summary.configured) {
    const err = new Error('Resend email service is not configured.');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }

  const from = process.env.EMAIL_FROM.trim();
  const headers = {
    Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(data?.message || `Resend API error (${res.status})`);
      err.code = `RESEND_${res.status}`;
      throw err;
    }

    return { messageId: data?.id || null, provider: 'resend' };
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyAndTestEmail({ sendTestMessage = false } = {}) {
  const summary = getEmailConfigSummary();
  if (!summary.configured) {
    return {
      ok: false,
      configured: false,
      provider: summary.provider,
      message: 'RESEND_API_KEY or EMAIL_FROM environment variables are missing.',
    };
  }

  if (sendTestMessage) {
    const target = process.env.GHF_ADMIN_EMAIL?.trim();
    if (!target) {
      return {
        ok: false,
        configured: true,
        provider: summary.provider,
        message: 'GHF_ADMIN_EMAIL is not configured to receive a test email.',
      };
    }

    await sendEmail({
      to: target,
      subject: 'GHF Portal – Resend Email Integration Test',
      html: '<p>This is a configuration verification message from the <strong>Guided Humanity Foundation (GHF)</strong> Monthly Assessment Portal via <strong>Resend</strong>.</p>',
      idempotencyKey: `GHF_TEST_${Date.now()}`,
    });
  }

  return {
    ok: true,
    configured: true,
    provider: summary.provider,
    message: sendTestMessage
      ? 'Test email dispatched via Resend successfully.'
      : 'Resend email configuration verified.',
  };
}
