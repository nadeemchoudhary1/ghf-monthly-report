import { REVIEW_STATUS_META } from '../components/admin/ReviewStatusBadge.jsx';
import { formatFieldAnswer } from '../schemas/answerMappings.js';
import { FIELDS } from '../schemas/formSchema.js';

/**
 * Normalize a member's mobile number for WhatsApp `wa.me/<number>` links.
 * Defaults 10-digit numbers to India (+91).
 */
export function normalizeWhatsAppPhone(rawPhone) {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }
  if (digits.length >= 11 && digits.length <= 15) {
    return digits;
  }
  return '';
}

function formatIsoDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Build a clear, actionable Hindi WhatsApp message summarizing the Responsible Review.
 */
export function buildReviewWhatsAppMessage({
  submission,
  reviewStatus,
  reviewAnswers = {},
}) {
  const a = submission?.a || {};
  const rv = reviewAnswers || submission?.rv || {};

  const memberName = a['1'] || 'सम्मानित साथी';
  const monthLabel = formatFieldAnswer(FIELDS['2'], submission?.month) || submission?.month || '';
  const statusLabel =
    REVIEW_STATUS_META[reviewStatus]?.label || REVIEW_STATUS_META[0].label;

  const lines = [
    '*GUIDED HUMANITY FOUNDATION (GHF)*',
    '*मासिक तरबियती एवं कारकर्दगी जायज़ा – ज़िम्मेदार समीक्षा*',
    '',
    `अस्सलामु अलैकुम / आदाब *${memberName}* जी,`,
    `आपके *${monthLabel}* के मासिक जायज़े (ID: ${submission?.sid || ''}) की समीक्षा पूरी हो गई है।`,
    '',
    `*समीक्षा स्थिति:* ${statusLabel}`,
  ];

  // 1. Core Assessment Observations (62-65)
  const evaluationItems = [
    ['62', 'नमाज़ और व्यक्तिगत इबादत'],
    ['63', 'इल्मी मुताला और सिलेबस'],
    ['64', 'मीटिंग में भागीदारी'],
    ['65', 'बैतुलमाल में योगदान'],
  ]
    .map(([id, title]) => {
      const val = rv[id] ? String(rv[id]).trim() : '';
      return val ? `• *${title}:* ${val}` : null;
    })
    .filter(Boolean);

  if (evaluationItems.length > 0) {
    lines.push('', '*1. मुख्य मूल्यांकन:*', ...evaluationItems);
  }

  // 2. Member Strengths (66)
  if (rv['66'] && String(rv['66']).trim()) {
    lines.push(
      '',
      '*2. आपकी प्रमुख खूबियाँ (मज़बूत पहलू):*',
      String(rv['66']).trim()
    );
  }

  // 3. Specific Guidance for Improvement (67)
  if (rv['67'] && String(rv['67']).trim()) {
    lines.push(
      '',
      '*3. सुधार के लिए विशेष हिदायत (जिन बातों पर ध्यान देना है):*',
      String(rv['67']).trim()
    );
  }

  // 4. Next Month Action Plan (68)
  if (rv['68'] && String(rv['68']).trim()) {
    lines.push(
      '',
      '*4. अगले महीने की कार्ययोजना (आपको क्या करना है):*',
      String(rv['68']).trim()
    );
  }

  // Reviewer & Date footer
  const reviewer =
    (rv['70'] && String(rv['70']).trim()) || submission?.reviewedBy || '';
  const reviewDate = rv['71'] ? formatIsoDate(String(rv['71']).trim()) : '';

  if (reviewer || reviewDate) {
    const metaParts = [];
    if (reviewer) metaParts.push(`*ज़िम्मेदार:* ${reviewer}`);
    if (reviewDate) metaParts.push(`*तारीख:* ${reviewDate}`);
    lines.push('', metaParts.join(' | '));
  }

  lines.push(
    '',
    'अल्लाह तआला आपके इल्म, अमल और खिदमात में बरकत अता फ़रमाए।',
    '_ईमान • इस्लाह • इत्तेहाद • इस्तिक़ामत_'
  );

  return lines.join('\n');
}

export function buildWhatsAppShareInfo({
  submission,
  reviewStatus,
  reviewAnswers,
}) {
  const rawMobile = submission?.a?.['3'] || '';
  const phoneDigits = normalizeWhatsAppPhone(rawMobile);
  const message = buildReviewWhatsAppMessage({
    submission,
    reviewStatus,
    reviewAnswers,
  });

  const url = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  return {
    rawMobile,
    phoneDigits,
    hasDirectPhone: Boolean(phoneDigits),
    message,
    url,
  };
}
