import { google } from 'googleapis';
import {
  FORM_FIELDS,
  formatDateTimeReadable,
  formatMonthHindi,
  formatReadableFieldValue,
  REVIEW_STATUS_LABELS,
  SECTIONS,
} from '../utils/answerMapper.js';

export const WORKSHEET_TABS = [
  'All Submissions',
  'Personal Information',
  'Prayer & Worship',
  'Quran & Study Progress',
  'Meetings & Participation',
  'Baitulmaal',
  'Organizational Activities',
  'Self Assessment',
  'Responsible Review',
];

const COMMON_PREFIX_HEADERS = [
  'Submission ID',
  'Assessment Month',
  'Member Name',
  'Submission Date',
];

const REVIEW_META_HEADERS = [
  'समीक्षा स्थिति (Review Status)',
  'समीक्षक (Reviewed By)',
  'समीक्षा समय (Reviewed At)',
];

let customSheetsClientOverride = null;

export function setGoogleSheetsClientOverride(client) {
  customSheetsClientOverride = client;
}

export function getGoogleSheetsConfigSummary() {
  const sheetIdConfigured = Boolean(
    process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SHEET_ID.trim()
  );
  const serviceEmailConfigured = Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim()
  );
  const privateKeyConfigured = Boolean(
    process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.trim()
  );

  return {
    configured: sheetIdConfigured && serviceEmailConfigured && privateKeyConfigured,
    sheetIdConfigured,
    serviceEmailConfigured,
    privateKeyConfigured,
  };
}

function getFieldsForTab(tabName) {
  if (tabName === 'All Submissions') {
    return SECTIONS.flatMap((s) => s.fieldIds);
  }
  return SECTIONS.filter((s) => s.sheetName === tabName).flatMap((s) => s.fieldIds);
}

export function getTabHeaders(tabName) {
  const fieldIds = getFieldsForTab(tabName);
  const fieldHeaders = fieldIds.map((id) => FORM_FIELDS[id]?.label || id);

  if (tabName === 'All Submissions' || tabName === 'Responsible Review') {
    return [...COMMON_PREFIX_HEADERS, ...REVIEW_META_HEADERS, ...fieldHeaders];
  }
  return [...COMMON_PREFIX_HEADERS, ...fieldHeaders];
}

export function buildTabRow(tabName, submission) {
  const a = submission?.a || {};
  const rv = submission?.rv || {};
  const fieldIds = getFieldsForTab(tabName);

  const prefix = [
    submission.sid,
    formatMonthHindi(submission.month) || submission.month || '',
    a['1'] || '',
    formatDateTimeReadable(submission.createdAt),
  ];

  const reviewMeta =
    tabName === 'All Submissions' || tabName === 'Responsible Review'
      ? [
          REVIEW_STATUS_LABELS[submission.rs ?? 0] || REVIEW_STATUS_LABELS[0],
          submission.reviewedBy || '',
          submission.reviewedAt ? formatDateTimeReadable(submission.reviewedAt) : '',
        ]
      : [];

  const fieldCells = fieldIds.map((id) => {
    const field = FORM_FIELDS[id];
    const source = field?.isResponsibleOnly ? rv : a;
    return formatReadableFieldValue(field, source[id]);
  });

  return [...prefix, ...reviewMeta, ...fieldCells];
}

function createGoogleSheetsClient() {
  if (customSheetsClientOverride) return customSheetsClientOverride;

  const summary = getGoogleSheetsConfigSummary();
  if (!summary.configured) {
    const err = new Error('Google Sheets service account credentials are not configured.');
    err.code = 'SHEETS_NOT_CONFIGURED';
    throw err;
  }

  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim(),
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

function columnNumberToLetter(colNum) {
  let num = colNum;
  let letter = '';
  while (num > 0) {
    const mod = (num - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    num = Math.floor((num - 1) / 26);
  }
  return letter;
}

/**
 * Ensure all 9 worksheet tabs exist and have their header row initialized.
 */
async function ensureWorksheetTabsAndHeaders(sheets, spreadsheetId) {
  const metaRes = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'properties.title,sheets.properties.title',
  });

  const existingTitles = new Set(
    (metaRes.data?.sheets || []).map((s) => s.properties?.title).filter(Boolean)
  );

  const missingTabs = WORKSHEET_TABS.filter((tab) => !existingTitles.has(tab));
  if (missingTabs.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: missingTabs.map((title) => ({
          addSheet: { properties: { title } },
        })),
      },
    });
  }

  // Batch check row 1 of all 9 tabs and initialize missing headers
  const headerRanges = WORKSHEET_TABS.map((tab) => `'${tab}'!A1:D1`);
  const existingHeadersRes = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: headerRanges,
  });

  const headerUpdates = [];
  const valueRanges = existingHeadersRes.data?.valueRanges || [];
  WORKSHEET_TABS.forEach((tab, idx) => {
    const row1 = valueRanges[idx]?.values?.[0] || [];
    if (row1.length === 0 || row1[0] !== 'Submission ID') {
      const headers = getTabHeaders(tab);
      const endCol = columnNumberToLetter(headers.length);
      headerUpdates.push({
        range: `'${tab}'!A1:${endCol}1`,
        values: [headers],
      });
    }
  });

  if (headerUpdates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: headerUpdates,
      },
    });
  }

  return metaRes.data?.properties?.title || 'GHF Monthly Assessment Database';
}

/**
 * Idempotent upsert across all 9 Google Sheets tabs keyed by Submission ID in Column A.
 * Uses batchGet + batchUpdate to minimize API quota usage.
 */
export async function syncSubmissionToGoogleSheets(submission) {
  const sheets = createGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim() || 'mock-sheet-id';

  await ensureWorksheetTabsAndHeaders(sheets, spreadsheetId);

  // Batch-read Column A (Submission IDs) across all 9 tabs
  const idRanges = WORKSHEET_TABS.map((tab) => `'${tab}'!A:A`);
  const idsRes = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: idRanges,
  });

  const valueRanges = idsRes.data?.valueRanges || [];
  const batchUpdates = [];

  for (let i = 0; i < WORKSHEET_TABS.length; i++) {
    const tab = WORKSHEET_TABS[i];
    const colAValues = valueRanges[i]?.values || [];
    const rowValues = buildTabRow(tab, submission);
    const endCol = columnNumberToLetter(rowValues.length);

    let existingRowIndex = -1;
    for (let r = 1; r < colAValues.length; r++) {
      if (colAValues[r]?.[0] === submission.sid) {
        existingRowIndex = r + 1; // 1-based sheet row index
        break;
      }
    }

    if (existingRowIndex > 1) {
      batchUpdates.push({
        range: `'${tab}'!A${existingRowIndex}:${endCol}${existingRowIndex}`,
        values: [rowValues],
      });
    } else {
      const nextRow = Math.max(2, colAValues.length + 1);
      batchUpdates.push({
        range: `'${tab}'!A${nextRow}:${endCol}${nextRow}`,
        values: [rowValues],
      });
    }
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: batchUpdates,
    },
  });

  return { syncedTabs: WORKSHEET_TABS.length, sid: submission.sid };
}

export async function testGoogleSheetsConnection() {
  const summary = getGoogleSheetsConfigSummary();
  if (!summary.configured && !customSheetsClientOverride) {
    return {
      ok: false,
      configured: false,
      message: 'Google Sheets credentials or GOOGLE_SHEET_ID are not configured.',
    };
  }

  const sheets = createGoogleSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim() || 'mock-sheet-id';
  const title = await ensureWorksheetTabsAndHeaders(sheets, spreadsheetId);

  return {
    ok: true,
    configured: true,
    spreadsheetTitle: title,
    worksheetCount: WORKSHEET_TABS.length,
    message: 'Google Sheets connected and worksheet structure verified.',
  };
}
