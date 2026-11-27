import {
  buildDecodedSectionsForSubmission,
  formatDateTimeReadable,
  formatMonthHindi,
  REVIEW_STATUS_LABELS,
} from './answerMapper.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildAdminNotificationEmail(submission, { frontendUrl } = {}) {
  const a = submission?.a || {};
  const memberName = a['1'] || 'GHF साथी';
  const monthLabel = formatMonthHindi(submission?.month) || submission?.month || '';
  const mobile = a['3'] || '—';
  const email = a['72'] || '—';
  const city = a['4'] || '—';
  const submittedAt = formatDateTimeReadable(submission?.createdAt);
  const reviewStatusLabel = REVIEW_STATUS_LABELS[submission?.rs ?? 0] || REVIEW_STATUS_LABELS[0];

  const baseFrontend = String(frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const detailLink = `${baseFrontend}/admin/submissions/${encodeURIComponent(submission.sid)}`;

  const sections = buildDecodedSectionsForSubmission(submission);

  const sectionsHtml = sections
    .map((sec) => {
      const rows = sec.fields
        .map(
          (f) => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:13px;width:45%;vertical-align:top;">${escapeHtml(f.label)}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:13px;font-weight:600;vertical-align:top;white-space:pre-line;">${escapeHtml(f.value || '—')}</td>
          </tr>`
        )
        .join('');

      return `
        <div style="margin-top:20px;border:1px solid #d1fae5;border-radius:10px;overflow:hidden;">
          <div style="background:#ecfdf5;padding:10px 14px;font-weight:700;color:#065f46;font-size:14px;border-bottom:1px solid #d1fae5;">
            ${escapeHtml(sec.title)}
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#ffffff;">
            ${rows}
          </table>
        </div>`;
    })
    .join('');

  const subject = `GHF Monthly Report – ${memberName} – ${monthLabel}`;

  const html = `<!doctype html>
<html lang="hi">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:16px;background:#f4faf6;font-family:'Noto Sans Devanagari',Arial,sans-serif;color:#0f172a;">
  <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;">
    <div style="background:#065f46;color:#ffffff;padding:20px 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#a7f3d0;font-weight:700;">GUIDED HUMANITY FOUNDATION</p>
      <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;">नया मासिक तरबियती एवं कारकर्दगी जायज़ा प्राप्त हुआ</h1>
    </div>

    <div style="padding:20px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
        <tr><td style="padding:8px 12px;font-size:13px;color:#475569;">सबमिशन आईडी (SID)</td><td style="padding:8px 12px;font-size:13px;font-weight:700;font-family:monospace;">${escapeHtml(submission.sid)}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#475569;">साथी का नाम</td><td style="padding:8px 12px;font-size:13px;font-weight:700;">${escapeHtml(memberName)}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#475569;">मोबाइल नंबर</td><td style="padding:8px 12px;font-size:13px;">${escapeHtml(mobile)}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#475569;">ईमेल पता</td><td style="padding:8px 12px;font-size:13px;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#475569;">शहर / इलाका</td><td style="padding:8px 12px;font-size:13px;">${escapeHtml(city)}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#475569;">जायज़े का महीना</td><td style="padding:8px 12px;font-size:13px;font-weight:600;">${escapeHtml(monthLabel)}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#475569;">सबमिशन समय</td><td style="padding:8px 12px;font-size:13px;">${escapeHtml(submittedAt)}</td></tr>
        <tr><td style="padding:8px 12px;font-size:13px;color:#475569;">समीक्षा स्थिति</td><td style="padding:8px 12px;font-size:13px;font-weight:600;color:#92400e;">${escapeHtml(reviewStatusLabel)}</td></tr>
      </table>

      <div style="margin-top:18px;text-align:center;">
        <a href="${escapeHtml(detailLink)}" style="display:inline-block;background:#065f46;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px;">
          एडमिन पैनल में पूरा जायज़ा देखें
        </a>
      </div>

      ${sectionsHtml}

      <p style="margin-top:24px;font-size:12px;color:#64748b;text-align:center;">
        GUIDED HUMANITY FOUNDATION • ईमान • इस्लाह • इत्तेहाद • इस्तिक़ामत
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}

export function buildMemberConfirmationEmail(submission, { contactInfo } = {}) {
  const a = submission?.a || {};
  const memberName = a['1'] || 'सम्मानित साथी';
  const monthLabel = formatMonthHindi(submission?.month) || submission?.month || '';
  const submittedAt = formatDateTimeReadable(submission?.createdAt);
  const contact = contactInfo || process.env.GHF_CONTACT_INFO || process.env.GHF_ADMIN_EMAIL || '';

  const subject = 'आपका GHF मासिक जायज़ा फॉर्म सफलतापूर्वक जमा हो गया है';

  const html = `<!doctype html>
<html lang="hi">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:16px;background:#f4faf6;font-family:'Noto Sans Devanagari',Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;">
    <div style="background:#065f46;color:#ffffff;padding:20px 24px;">
      <p style="margin:0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#a7f3d0;font-weight:700;">GUIDED HUMANITY FOUNDATION</p>
      <h1 style="margin:6px 0 0;font-size:18px;line-height:1.4;">मासिक जायज़ा सबमिशन की पुष्टि</h1>
    </div>

    <div style="padding:22px 24px;font-size:14px;line-height:1.7;">
      <p style="margin:0 0 12px;">अस्सलामु अलैकुम / आदाब <strong>${escapeHtml(memberName)}</strong>,</p>
      <p style="margin:0 0 16px;">
        आपका <strong>${escapeHtml(monthLabel)}</strong> का मासिक तरबियती एवं कारकर्दगी जायज़ा फ़ॉर्म सफलतापूर्वक हमारे डेटाबेस में जमा हो गया है।
      </p>

      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:4px 0;font-size:13px;"><strong>सबमिशन आईडी (SID):</strong> <span style="font-family:monospace;">${escapeHtml(submission.sid)}</span></p>
        <p style="margin:4px 0;font-size:13px;"><strong>जायज़े का महीना:</strong> ${escapeHtml(monthLabel)}</p>
        <p style="margin:4px 0;font-size:13px;"><strong>जमा करने का समय:</strong> ${escapeHtml(submittedAt)}</p>
      </div>

      <p style="margin:0 0 12px;font-size:13px;color:#475569;">
        अल्लाह तआला आपके इल्म, अमल और तंज़ीमी कोशिशों में बरकत अता फ़रमाए। आमीन।
      </p>

      ${
        contact
          ? `<p style="margin:12px 0 0;font-size:12px;color:#64748b;">संपर्क जानकारी: ${escapeHtml(contact)}</p>`
          : ''
      }

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:18px 0;" />
      <p style="margin:0;font-size:12px;color:#64748b;text-align:center;">
        GUIDED HUMANITY FOUNDATION • ईमान • इस्लाह • इत्तेहाद • इस्तिक़ामत
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
}
