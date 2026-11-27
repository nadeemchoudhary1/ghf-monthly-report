import IntegrationOutbox from '../models/IntegrationOutbox.js';
import Submission from '../models/Submission.js';
import { FORM_FIELDS, validateAndCompactAnswers } from '../utils/answerMapper.js';
import { escapeRegex } from '../utils/queryUtils.js';
import { enqueueSheetsReviewSync } from './syncWorker.js';

const ALLOWED_PAGE_SIZES = new Set([10, 25, 50]);

function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function deriveIntegrationStatuses(outbox) {
  if (!outbox) {
    return {
      emailStatus: 'pending',
      sheetStatus: 'pending',
      outbox: null,
    };
  }

  // Email status aggregates admin & member email outbox codes
  const emailCodes = [outbox.emailAdmin, outbox.emailMember].filter(
    (c) => c !== null && c !== undefined
  );
  let emailStatus = 'pending';
  if (emailCodes.includes(2)) {
    emailStatus = 'failed';
  } else if (emailCodes.length > 0 && emailCodes.every((c) => c === 1)) {
    emailStatus = 'sent';
  }

  let sheetStatus = 'pending';
  if (outbox.sheetSync === 1) sheetStatus = 'synced';
  else if (outbox.sheetSync === 2) sheetStatus = 'failed';

  return {
    emailStatus,
    sheetStatus,
    outbox: {
      emailAdmin: outbox.emailAdmin,
      emailMember: outbox.emailMember,
      sheetSync: outbox.sheetSync,
      lastAttempt: outbox.lastAttempt,
      lastSuccessAt: outbox.lastSuccessAt,
      lastError: outbox.lastError,
    },
  };
}

function toSummaryItem(doc, outboxMap = new Map()) {
  const syncMeta = deriveIntegrationStatuses(outboxMap.get(doc.sid));
  return {
    sid: doc.sid,
    sv: doc.sv,
    month: doc.month,
    memberName: doc.a?.['1'] || '',
    mobile: doc.a?.['3'] || '',
    email: doc.a?.['72'] || '',
    city: doc.a?.['4'] || '',
    markaz: doc.a?.['5'] || '',
    rs: doc.rs ?? 0,
    emailStatus: syncMeta.emailStatus,
    sheetStatus: syncMeta.sheetStatus,
    createdAt: doc.createdAt,
    reviewedAt: doc.reviewedAt || null,
  };
}

async function fetchOutboxMap(sids = []) {
  if (sids.length === 0) return new Map();
  const rows = await IntegrationOutbox.find({ sid: { $in: sids } })
    .select('-_id sid emailAdmin emailMember sheetSync lastAttempt lastSuccessAt lastError')
    .lean();
  return new Map(rows.map((r) => [r.sid, r]));
}

export async function getAdminDashboardData({ page = 1, limit = 10 } = {}) {
  const currentMonth = getCurrentYearMonth();
  const safeLimit = ALLOWED_PAGE_SIZES.has(Number(limit)) ? Number(limit) : 10;
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const skip = (safePage - 1) * safeLimit;

  const [
    totalSubmissions,
    currentMonthSubmissions,
    pendingReview,
    reviewedCount,
    approvedCount,
    recentDocs,
  ] = await Promise.all([
    Submission.countDocuments({}),
    Submission.countDocuments({ month: currentMonth }),
    Submission.countDocuments({ rs: 0 }),
    Submission.countDocuments({ rs: 1 }),
    Submission.countDocuments({ rs: 2 }),
    Submission.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .select('-_id sid sv month rs createdAt reviewedAt a.1 a.3 a.4 a.5 a.72')
      .lean(),
  ]);

  const outboxMap = await fetchOutboxMap(recentDocs.map((d) => d.sid));

  return {
    stats: {
      totalSubmissions,
      currentMonthSubmissions,
      currentMonth,
      pendingReview,
      reviewed: reviewedCount,
      approved: approvedCount,
    },
    recentSubmissions: recentDocs.map((doc) => toSummaryItem(doc, outboxMap)),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: totalSubmissions,
      totalPages: Math.max(1, Math.ceil(totalSubmissions / safeLimit)),
    },
  };
}

export async function listAdminSubmissions({
  page = 1,
  limit = 10,
  q = '',
  month = '',
  city = '',
  rs = '',
  sort = 'newest',
} = {}) {
  const safeLimit = ALLOWED_PAGE_SIZES.has(Number(limit)) ? Number(limit) : 10;
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const skip = (safePage - 1) * safeLimit;

  const query = {};

  if (q && String(q).trim()) {
    const regex = new RegExp(escapeRegex(String(q).trim()), 'i');
    query.$or = [
      { sid: regex },
      { 'a.1': regex },
      { 'a.3': regex },
      { 'a.4': regex },
      { 'a.72': regex },
    ];
  }

  if (month && /^\d{4}-(0[1-9]|1[0-2])$/.test(String(month).trim())) {
    query.month = String(month).trim();
  }

  if (city && String(city).trim()) {
    query['a.4'] = new RegExp(`^${escapeRegex(String(city).trim())}$`, 'i');
  }

  if (rs !== '' && rs !== undefined && rs !== null) {
    const parsedRs = Number(rs);
    if ([0, 1, 2].includes(parsedRs)) {
      query.rs = parsedRs;
    }
  }

  let sortSpec = { createdAt: -1 };
  switch (sort) {
    case 'oldest':
      sortSpec = { createdAt: 1 };
      break;
    case 'name_asc':
      sortSpec = { 'a.1': 1, createdAt: -1 };
      break;
    case 'name_desc':
      sortSpec = { 'a.1': -1, createdAt: -1 };
      break;
    case 'month_desc':
      sortSpec = { month: -1, createdAt: -1 };
      break;
    case 'month_asc':
      sortSpec = { month: 1, createdAt: -1 };
      break;
    case 'newest':
    default:
      sortSpec = { createdAt: -1 };
      break;
  }

  const [total, docs, months, cities] = await Promise.all([
    Submission.countDocuments(query),
    Submission.find(query)
      .sort(sortSpec)
      .skip(skip)
      .limit(safeLimit)
      .select('-_id sid sv month rs createdAt reviewedAt a.1 a.3 a.4 a.5 a.72')
      .lean(),
    Submission.distinct('month'),
    Submission.distinct('a.4'),
  ]);

  const outboxMap = await fetchOutboxMap(docs.map((d) => d.sid));

  return {
    items: docs.map((doc) => toSummaryItem(doc, outboxMap)),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
    filterOptions: {
      months: months.filter(Boolean).sort().reverse(),
      cities: cities.filter(Boolean).sort(),
    },
  };
}

export async function getAdminSubmissionDetail(sid) {
  const cleanSid = String(sid).trim();
  const [doc, outbox] = await Promise.all([
    Submission.findOne({ sid: cleanSid })
      .select('-_id sid sv month a rs rv createdAt reviewedAt reviewedBy')
      .lean(),
    IntegrationOutbox.findOne({ sid: cleanSid })
      .select('-_id sid emailAdmin emailMember sheetSync lastAttempt lastSuccessAt lastError')
      .lean(),
  ]);

  if (!doc) return null;
  const syncMeta = deriveIntegrationStatuses(outbox);
  return {
    ...doc,
    emailStatus: syncMeta.emailStatus,
    sheetStatus: syncMeta.sheetStatus,
    outbox: syncMeta.outbox,
  };
}

export async function updateAdminSubmissionReview(sid, { rs, rv }, adminUsername) {
  const parsedRs = Number(rs);
  if (![0, 1, 2].includes(parsedRs)) {
    return {
      ok: false,
      statusCode: 400,
      message: 'Review status (rs) must be 0 (Pending), 1 (Reviewed), or 2 (Approved).',
    };
  }

  const incomingRv = rv && typeof rv === 'object' && !Array.isArray(rv) ? rv : {};

  for (const key of Object.keys(incomingRv)) {
    const field = FORM_FIELDS[key];
    if (!field || !field.isResponsibleOnly) {
      return {
        ok: false,
        statusCode: 400,
        message: `Field "${key}" is not a Section 9 responsible review field.`,
      };
    }
  }

  const validation = validateAndCompactAnswers(incomingRv, {
    allowResponsibleFields: true,
  });

  if (!validation.valid) {
    return {
      ok: false,
      statusCode: 400,
      message: validation.errors[0] || 'Invalid review fields.',
      errors: validation.errors,
    };
  }

  const updated = await Submission.findOneAndUpdate(
    { sid: String(sid).trim() },
    {
      $set: {
        rs: parsedRs,
        rv: validation.compact,
        reviewedAt: parsedRs === 0 && Object.keys(validation.compact).length === 0 ? null : new Date(),
        reviewedBy: adminUsername || 'admin',
      },
    },
    { new: true }
  )
    .select('-_id sid sv month a rs rv createdAt reviewedAt reviewedBy')
    .lean();

  if (!updated) {
    return {
      ok: false,
      statusCode: 404,
      message: 'Submission not found.',
    };
  }

  // Trigger Google Sheets row update without blocking review save
  try {
    await enqueueSheetsReviewSync(updated.sid);
  } catch (err) {
    console.error('[REVIEW] Failed to schedule Google Sheets review sync:', err?.message || 'Unknown error');
  }

  const outbox = await IntegrationOutbox.findOne({ sid: updated.sid })
    .select('-_id sid emailAdmin emailMember sheetSync lastAttempt lastSuccessAt lastError')
    .lean();
  const syncMeta = deriveIntegrationStatuses(outbox);

  return {
    ok: true,
    statusCode: 200,
    submission: {
      ...updated,
      emailStatus: syncMeta.emailStatus,
      sheetStatus: syncMeta.sheetStatus,
      outbox: syncMeta.outbox,
    },
  };
}
