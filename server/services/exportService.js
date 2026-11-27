import ExcelJS from 'exceljs';
import Submission from '../models/Submission.js';
import {
  FORM_FIELDS,
  formatDateTimeReadable,
  formatMonthHindi,
  formatReadableFieldValue,
  REVIEW_STATUS_LABELS,
  SECTIONS,
} from '../utils/answerMapper.js';
import { escapeRegex } from '../utils/queryUtils.js';
import { buildTabRow, getTabHeaders } from './googleSheetsService.js';

function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function querySubmissionsForExport({
  month = '',
  city = '',
  rs = '',
  from = '',
  to = '',
} = {}) {
  const query = {};

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

  if (from || to) {
    query.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (!Number.isNaN(fromDate.getTime())) query.createdAt.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!Number.isNaN(toDate.getTime())) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(to).trim())) {
          toDate.setUTCHours(23, 59, 59, 999);
        }
        query.createdAt.$lte = toDate;
      }
    }
    if (Object.keys(query.createdAt).length === 0) {
      delete query.createdAt;
    }
  }

  return Submission.find(query)
    .sort({ createdAt: -1 })
    .select('-_id sid sv month a rs rv createdAt reviewedAt reviewedBy')
    .lean();
}

export function generateCsvBuffer(submissions = []) {
  const headers = getTabHeaders('All Submissions');
  const lines = [headers.map(escapeCsvCell).join(',')];

  for (const sub of submissions) {
    const row = buildTabRow('All Submissions', sub);
    lines.push(row.map(escapeCsvCell).join(','));
  }

  // UTF-8 BOM ensures Microsoft Excel renders Devanagari Hindi correctly
  return Buffer.from('\uFEFF' + lines.join('\r\n'), 'utf8');
}

const SECTION_EXCEL_SHEETS = [
  { id: 1, name: '1. Personal Info' },
  { id: 2, name: '2. Prayer & Worship' },
  { id: 3, name: '3. Quran Study' },
  { id: 4, name: '4. Study Series' },
  { id: 5, name: '5. Meetings' },
  { id: 6, name: '6. Baitulmaal' },
  { id: 7, name: '7. Org Activities' },
  { id: 8, name: '8. Self Assessment' },
  { id: 9, name: '9. Responsible Review' },
];

export async function generateXlsxBuffer(submissions = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Guided Humanity Foundation Portal';
  workbook.created = new Date();

  const styleHeaderRow = (sheet) => {
    const row = sheet.getRow(1);
    row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF065F46' },
    };
    sheet.columns.forEach((col) => {
      col.width = 22;
    });
  };

  // 1. Master worksheet containing all fields
  const masterSheet = workbook.addWorksheet('All Submissions');
  masterSheet.addRow(getTabHeaders('All Submissions'));
  for (const sub of submissions) {
    masterSheet.addRow(buildTabRow('All Submissions', sub));
  }
  styleHeaderRow(masterSheet);

  // 2. Separate worksheets for all 9 assessment sections
  for (const secMeta of SECTION_EXCEL_SHEETS) {
    const section = SECTIONS.find((s) => s.id === secMeta.id);
    if (!section) continue;

    const ws = workbook.addWorksheet(secMeta.name);
    const headers = [
      'Submission ID',
      'Assessment Month',
      'Member Name',
      'Submission Date',
      ...(section.id === 9 ? ['समीक्षा स्थिति (Review Status)', 'समीक्षक', 'समीक्षा समय'] : []),
      ...section.fieldIds.map((id) => FORM_FIELDS[id]?.label || id),
    ];
    ws.addRow(headers);

    for (const sub of submissions) {
      const a = sub?.a || {};
      const rv = sub?.rv || {};
      const source = section.id === 9 ? rv : a;
      const row = [
        sub.sid,
        formatMonthHindi(sub.month) || sub.month || '',
        a['1'] || '',
        formatDateTimeReadable(sub.createdAt),
        ...(section.id === 9
          ? [
              REVIEW_STATUS_LABELS[sub.rs ?? 0] || REVIEW_STATUS_LABELS[0],
              sub.reviewedBy || '',
              sub.reviewedAt ? formatDateTimeReadable(sub.reviewedAt) : '',
            ]
          : []),
        ...section.fieldIds.map((id) =>
          formatReadableFieldValue(FORM_FIELDS[id], source[id])
        ),
      ];
      ws.addRow(row);
    }
    styleHeaderRow(ws);
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
