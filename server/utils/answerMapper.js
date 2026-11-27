/**
 * Server-side mirror of client/src/schemas/formSchema.js & answerMappings.js.
 * Serves as the strict validation and readable Hindi decoding source of truth
 * for MongoDB storage, HTML emails, Google Sheets synchronization, and CSV/XLSX exports.
 */

export const SCHEMA_VERSION = 1;

export const OPTION_SETS = {
  NAMAZ_STATUS: { 1: 'नियमित', 2: 'कभी-कभी छूटती है', 3: 'अक्सर छूटती है' },
  JAMAAT_FREQUENCY: { 1: 'लगभग हमेशा', 2: 'अक्सर', 3: 'कभी-कभी', 4: 'बहुत कम' },
  TILAWAT_FREQUENCY: { 1: 'रोज़ाना', 2: 'सप्ताह में 4–5 दिन', 3: '1–3 दिन', 4: 'बहुत कम' },
  REGULAR_SOMETIMES_NO: { 1: 'नियमित', 2: 'कभी-कभी', 3: 'नहीं' },
  QURAN_TAFHEEM_STATUS: { 1: 'हाँ, नियमित', 2: 'कभी-कभी', 3: 'अभी शुरू नहीं किया' },
  SYLLABUS_STATUS: { 1: 'मुकम्मल', 2: 'जारी', 3: 'शुरू नहीं' },
  MEETING_ATTENDANCE_COUNT: { 0: '0', 1: '1', 2: '2', 3: '3', 4: '4' },
  YES_NO: { 1: 'हाँ', 2: 'नहीं' },
  BAITULMAAL_FREQUENCY: { 1: 'हर महीने', 2: 'कभी-कभी', 3: 'अभी तक शुरू नहीं किया' },
  UNDERSTANDING_LEVEL: { 1: 'पूरी तरह', 2: 'कुछ हद तक', 3: 'और समझने की ज़रूरत है' },
};

export const REVIEW_STATUS_LABELS = {
  0: 'लंबित समीक्षा (Pending)',
  1: 'समीक्षित (Reviewed)',
  2: 'स्वीकृत (Approved)',
};

export const SECTIONS = [
  {
    id: 1,
    title: 'भाग 1 : साथी की व्यक्तिगत जानकारी',
    sheetName: 'Personal Information',
    fieldIds: ['1', '2', '3', '72', '4', '5', '6', '7'],
  },
  {
    id: 2,
    title: 'भाग 2 : नमाज़ और व्यक्तिगत इबादत का जायज़ा',
    sheetName: 'Prayer & Worship',
    fieldIds: ['8', '9', '10', '11', '12', '13', '14', '15'],
  },
  {
    id: 3,
    title: 'भाग 3 : क़ुरआन का मुताला',
    sheetName: 'Quran & Study Progress',
    fieldIds: ['16', '17', '18', '19', '20'],
  },
  {
    id: 4,
    title: 'भाग 4 : निर्धारित सिलेबस का जायज़ा',
    sheetName: 'Quran & Study Progress',
    fieldIds: [
      '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
      '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
      '41', '42', '43',
    ],
  },
  {
    id: 5,
    title: 'भाग 5 : मरकज़ और मुक़ामी मीटिंग में भागीदारी',
    sheetName: 'Meetings & Participation',
    fieldIds: ['44', '45', '46', '47', '48', '49'],
  },
  {
    id: 6,
    title: 'भाग 6 : बैतुलमाल में योगदान',
    sheetName: 'Baitulmaal',
    fieldIds: ['50', '51', '52'],
  },
  {
    id: 7,
    title: 'भाग 7 : तरबियत और तंज़ीमी गतिविधियाँ',
    sheetName: 'Organizational Activities',
    fieldIds: ['53', '54', '55'],
  },
  {
    id: 8,
    title: 'भाग 8 : स्वयं अपना जायज़ा',
    sheetName: 'Self Assessment',
    fieldIds: ['56', '57', '58', '59', '60', '61'],
  },
  {
    id: 9,
    title: 'भाग 9 : ज़िम्मेदार की समीक्षा',
    sheetName: 'Responsible Review',
    fieldIds: ['62', '63', '64', '65', '66', '67', '68', '69', '70', '71'],
  },
];

export const FORM_FIELDS = {
  // Section 1: Personal Info
  '1': { id: 1, sectionId: 1, label: 'साथी का पूरा नाम', type: 'text', maxLength: 120 },
  '2': { id: 2, sectionId: 1, label: 'जायज़े का महीना', type: 'month' },
  '3': { id: 3, sectionId: 1, label: 'मोबाइल नंबर', type: 'tel', maxLength: 20 },
  '4': { id: 4, sectionId: 1, label: 'शहर / इलाका', type: 'text', maxLength: 120 },
  '5': { id: 5, sectionId: 1, label: 'मरकज़ का नाम', type: 'text', maxLength: 120 },
  '6': { id: 6, sectionId: 1, label: 'GHF से जुड़ने की तारीख', type: 'date' },
  '7': { id: 7, sectionId: 1, label: 'वर्तमान तंज़ीमी ज़िम्मेदारी', type: 'text', maxLength: 150 },
  '72': { id: 72, sectionId: 1, label: 'ईमेल पता', type: 'email', maxLength: 160 },

  // Section 2: Namaz & Personal Ibadat
  '8': { id: 8, sectionId: 2, label: 'फ़ज्र की नमाज़', type: 'radio', options: OPTION_SETS.NAMAZ_STATUS },
  '9': { id: 9, sectionId: 2, label: 'ज़ुहर की नमाज़', type: 'radio', options: OPTION_SETS.NAMAZ_STATUS },
  '10': { id: 10, sectionId: 2, label: 'अस्र की नमाज़', type: 'radio', options: OPTION_SETS.NAMAZ_STATUS },
  '11': { id: 11, sectionId: 2, label: 'मग़रिब की नमाज़', type: 'radio', options: OPTION_SETS.NAMAZ_STATUS },
  '12': { id: 12, sectionId: 2, label: 'इशा की नमाज़', type: 'radio', options: OPTION_SETS.NAMAZ_STATUS },
  '13': { id: 13, sectionId: 2, label: 'क्या आप अधिकतर नमाज़ें जमाअत के साथ अदा करते हैं?', type: 'radio', options: OPTION_SETS.JAMAAT_FREQUENCY },
  '14': { id: 14, sectionId: 2, label: 'क्या आप रोज़ाना कुरआन की तिलावत करते हैं?', type: 'radio', options: OPTION_SETS.TILAWAT_FREQUENCY },
  '15': { id: 15, sectionId: 2, label: 'क्या आप अपने आमाल और किरदार का मुहासबा करते हैं?', type: 'radio', options: OPTION_SETS.REGULAR_SOMETIMES_NO },

  // Section 3: Quran Mutala
  '16': { id: 16, sectionId: 3, label: 'क्या आप कुरआन मजीद का तर्जुमा और तफ़्हीम पढ़ रहे हैं?', type: 'radio', options: OPTION_SETS.QURAN_TAFHEEM_STATUS },
  '17': { id: 17, sectionId: 3, label: 'इस महीने पढ़ी गई सूरह / पारा', type: 'text', maxLength: 200 },
  '18': { id: 18, sectionId: 3, label: 'आयतें (लगभग)', type: 'number', min: 0, max: 100000 },
  '19': { id: 19, sectionId: 3, label: 'अध्ययन की गई किताब / तफ़्सीर', type: 'text', maxLength: 200 },
  '20': { id: 20, sectionId: 3, label: 'मुताले से सीखी गई कोई बात जिसे अमल में लाने की कोशिश की:', type: 'textarea', maxLength: 2000 },

  // Section 4: Prescribed Syllabus (20 books + 3 progress fields)
  '21': { id: 21, sectionId: 4, label: '1. कुरआन (तर्जुमा / तफ़्हीम)', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '22': { id: 22, sectionId: 4, label: '2. सहीह हदीस', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '23': { id: 23, sectionId: 4, label: '3. तौहीद, रिसालत और आख़िरत के अक़्ली सबूत', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '24': { id: 24, sectionId: 4, label: '4. जीवन मृत्यु के पश्चात', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '25': { id: 25, sectionId: 4, label: '5. शांति मार्ग', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '26': { id: 26, sectionId: 4, label: '6. इस्लाम और इंसान', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '27': { id: 27, sectionId: 4, label: '7. सत्य धर्म', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '28': { id: 28, sectionId: 4, label: '8. इस्लाम का नैतिक दृष्टिकोण', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '29': { id: 29, sectionId: 4, label: '9. इस्लामी आंदोलन के नैतिक आधार', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '30': { id: 30, sectionId: 4, label: '10. बनाव और बिगाड़', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '31': { id: 31, sectionId: 4, label: '11. क़ुव्वत का असल राज़', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '32': { id: 32, sectionId: 4, label: '12. शहादते हक़', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '33': { id: 33, sectionId: 4, label: '13. इस्लाम की जीवन व्यवस्था', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '34': { id: 34, sectionId: 4, label: '14. ख़ुतबात (मुकम्मल)', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '35': { id: 35, sectionId: 4, label: '15. तहरीके इस्लामी कामयाबी की शर्तें', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '36': { id: 36, sectionId: 4, label: '16. अहम हिदायतें', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '37': { id: 37, sectionId: 4, label: '17. नबी की सीरत (जीवनी / अर-रहीक़ुल मख़तूम)', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '38': { id: 38, sectionId: 4, label: '18. हमारे आपसी ताल्लुक़ात', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '39': { id: 39, sectionId: 4, label: '19. अपनी इस्लाह आप', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '40': { id: 40, sectionId: 4, label: '20. ख़ुतबाए मद्रास', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '41': { id: 41, sectionId: 4, label: 'इस महीने मुकम्मल की गई किताब', type: 'text', maxLength: 200 },
  '42': { id: 42, sectionId: 4, label: 'फ़िलहाल पढ़ी जा रही किताब', type: 'text', maxLength: 200 },
  '43': { id: 43, sectionId: 4, label: 'अगले महीने पढ़ने का इरादा', type: 'text', maxLength: 200 },

  // Section 5: Meetings
  '44': { id: 44, sectionId: 5, label: 'मरकज़ की मासिक मीटिंग — उपस्थिति', type: 'rating', options: OPTION_SETS.MEETING_ATTENDANCE_COUNT },
  '45': { id: 45, sectionId: 5, label: 'मरकज़ मीटिंग अनुपस्थित कारण', type: 'text', maxLength: 500 },
  '46': { id: 46, sectionId: 5, label: 'मुक़ामी मीटिंग — उपस्थिति', type: 'rating', options: OPTION_SETS.MEETING_ATTENDANCE_COUNT },
  '47': { id: 47, sectionId: 5, label: 'मुक़ामी मीटिंग अनुपस्थित कारण', type: 'text', maxLength: 500 },
  '48': { id: 48, sectionId: 5, label: 'सिटी लेवल मीटिंग में शामिल हुए?', type: 'radio', options: OPTION_SETS.YES_NO },
  '49': { id: 49, sectionId: 5, label: 'सिटी लेवल मीटिंग अनुपस्थित कारण', type: 'text', maxLength: 500 },

  // Section 6: Baitulmaal
  '50': { id: 50, sectionId: 6, label: 'GHF के बैतुलमाल में योगदान', type: 'radio', options: OPTION_SETS.BAITULMAAL_FREQUENCY },
  '51': { id: 51, sectionId: 6, label: 'इस महीने योगदान की राशि (₹)', type: 'number', min: 0, max: 10000000 },
  '52': { id: 52, sectionId: 6, label: 'योगदान न करने का विशेष कारण', type: 'text', maxLength: 500 },

  // Section 7: Tarbiyati & Tanzeemi Activities
  '53': { id: 53, sectionId: 7, label: 'GHF के निर्धारित तरबियती कार्यक्रमों में भागीदारी', type: 'radio', options: OPTION_SETS.REGULAR_SOMETIMES_NO },
  '54': { id: 54, sectionId: 7, label: 'दावत, इस्लाह या सामाजिक गतिविधि में शामिल हुए?', type: 'radio', options: OPTION_SETS.YES_NO },
  '55': { id: 55, sectionId: 7, label: 'संगठन के उद्देश्य, मिशन और कार्यपद्धति की समझ', type: 'radio', options: OPTION_SETS.UNDERSTANDING_LEVEL },

  // Section 8: Self Evaluation
  '56': { id: 56, sectionId: 8, label: '1. ज़िंदगी में अच्छी तब्दीली की कोशिश', type: 'textarea', maxLength: 2000 },
  '57': { id: 57, sectionId: 8, label: '2. सबसे बड़ी कमी या कमज़ोरी', type: 'textarea', maxLength: 2000 },
  '58': { id: 58, sectionId: 8, label: '3. GHF की तरबियत और तंज़ीमी व्यवस्था में सुधार के सुझाव', type: 'textarea', maxLength: 2000 },
  '59': { id: 59, sectionId: 8, label: 'लक्ष्य 1', type: 'text', maxLength: 300 },
  '60': { id: 60, sectionId: 8, label: 'लक्ष्य 2', type: 'text', maxLength: 300 },
  '61': { id: 61, sectionId: 8, label: 'लक्ष्य 3', type: 'text', maxLength: 300 },

  // Section 9: Responsible Person Review (Reserved for authorized admin phase)
  '62': { id: 62, sectionId: 9, isResponsibleOnly: true, label: 'नमाज़ और व्यक्तिगत इबादत', type: 'textarea', maxLength: 2000 },
  '63': { id: 63, sectionId: 9, isResponsibleOnly: true, label: 'इल्मी मुताले और सिलेबस की प्रगति', type: 'textarea', maxLength: 2000 },
  '64': { id: 64, sectionId: 9, isResponsibleOnly: true, label: 'मीटिंग में भागीदारी', type: 'textarea', maxLength: 2000 },
  '65': { id: 65, sectionId: 9, isResponsibleOnly: true, label: 'बैतुलमाल में योगदान', type: 'textarea', maxLength: 2000 },
  '66': { id: 66, sectionId: 9, isResponsibleOnly: true, label: 'साथी की प्रमुख खूबियाँ', type: 'textarea', maxLength: 2000 },
  '67': { id: 67, sectionId: 9, isResponsibleOnly: true, label: 'सुधार के लिए विशेष हिदायत', type: 'textarea', maxLength: 2000 },
  '68': { id: 68, sectionId: 9, isResponsibleOnly: true, label: 'अगले महीने की कार्ययोजना', type: 'textarea', maxLength: 2000 },
  '69': { id: 69, sectionId: 9, isResponsibleOnly: true, label: 'साथी के हस्ताक्षर', type: 'text', maxLength: 150 },
  '70': { id: 70, sectionId: 9, isResponsibleOnly: true, label: 'ज़िम्मेदार के हस्ताक्षर', type: 'text', maxLength: 150 },
  '71': { id: 71, sectionId: 9, isResponsibleOnly: true, label: 'जायज़े की तारीख', type: 'date' },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const HINDI_MONTHS = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
];

/**
 * Strip control characters, null bytes, and angle-bracket HTML tags while preserving Devanagari/Unicode text.
 */
export function sanitizeTextInput(value, maxLength = 2000) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\0/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate and convert incoming answers into the compact database format `a`.
 * Empty values are omitted so MongoDB never stores empty fields or repeated labels.
 */
export function validateAndCompactAnswers(
  rawAnswers,
  { allowResponsibleFields = false, expectedMonth = null } = {}
) {
  if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
    return { valid: false, errors: ['answers must be a plain object.'], compact: null };
  }

  const errors = [];
  const compact = {};

  for (const [key, rawValue] of Object.entries(rawAnswers)) {
    const field = FORM_FIELDS[key];
    if (!field) {
      errors.push(`Unknown field ID: "${key}".`);
      continue;
    }

    if (field.isResponsibleOnly && !allowResponsibleFields) {
      errors.push(`Field ID "${key}" belongs to Section 9 and is restricted from public submission.`);
      continue;
    }

    if (rawValue === undefined || rawValue === null || rawValue === '') {
      continue;
    }

    if (field.type === 'radio' || field.type === 'rating') {
      const code = typeof rawValue === 'number' ? rawValue : Number(rawValue);
      if (!Number.isInteger(code) || field.options?.[code] === undefined) {
        errors.push(`Invalid option code for field "${key}".`);
        continue;
      }
      compact[key] = code;
      continue;
    }

    if (field.type === 'checkbox') {
      if (!Array.isArray(rawValue)) {
        errors.push(`Field "${key}" must be an array of numeric option codes.`);
        continue;
      }
      if (rawValue.length === 0) continue;
      const codes = [];
      let invalidCode = false;
      for (const item of rawValue) {
        const code = typeof item === 'number' ? item : Number(item);
        if (!Number.isInteger(code) || field.options?.[code] === undefined) {
          invalidCode = true;
          break;
        }
        if (!codes.includes(code)) codes.push(code);
      }
      if (invalidCode) {
        errors.push(`Invalid checkbox option code in field "${key}".`);
        continue;
      }
      compact[key] = codes;
      continue;
    }

    if (field.type === 'number') {
      const num = typeof rawValue === 'number' ? rawValue : Number(String(rawValue).trim());
      if (Number.isNaN(num) || !Number.isFinite(num)) {
        errors.push(`Field "${key}" must be a valid number.`);
        continue;
      }
      if (field.min !== undefined && num < field.min) {
        errors.push(`Field "${key}" must be at least ${field.min}.`);
        continue;
      }
      if (field.max !== undefined && num > field.max) {
        errors.push(`Field "${key}" exceeds maximum allowed value.`);
        continue;
      }
      compact[key] = num;
      continue;
    }

    if (field.type === 'month') {
      const cleaned = sanitizeTextInput(String(rawValue), 16);
      if (!cleaned) continue;
      if (!MONTH_REGEX.test(cleaned)) {
        errors.push(`Field "${key}" must be in YYYY-MM format.`);
        continue;
      }
      if (expectedMonth && cleaned !== expectedMonth) {
        errors.push(`Field "${key}" must match the submission month (${expectedMonth}).`);
        continue;
      }
      compact[key] = cleaned;
      continue;
    }

    if (field.type === 'date') {
      const cleaned = sanitizeTextInput(String(rawValue), 16);
      if (!cleaned) continue;
      if (!DATE_REGEX.test(cleaned)) {
        errors.push(`Field "${key}" must be a valid YYYY-MM-DD date.`);
        continue;
      }
      compact[key] = cleaned;
      continue;
    }

    if (field.type === 'email') {
      const cleaned = sanitizeTextInput(String(rawValue), 160).toLowerCase();
      if (!cleaned) continue;
      if (!EMAIL_REGEX.test(cleaned)) {
        errors.push(`Field "${key}" must be a valid email address.`);
        continue;
      }
      compact[key] = cleaned;
      continue;
    }

    if (field.type === 'tel') {
      const cleaned = sanitizeTextInput(String(rawValue), 24);
      if (!cleaned) continue;
      const digitsOnly = cleaned.replace(/[\s\-+()]/g, '');
      if (!/^\d{10,15}$/.test(digitsOnly)) {
        errors.push(`Field "${key}" must be a valid mobile number (10-15 digits).`);
        continue;
      }
      compact[key] = cleaned;
      continue;
    }

    if (typeof rawValue !== 'string') {
      errors.push(`Field "${key}" must be text.`);
      continue;
    }
    const cleaned = sanitizeTextInput(rawValue, field.maxLength || 2000);
    if (cleaned) {
      compact[key] = cleaned;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    compact,
  };
}

export function formatMonthHindi(monthStr) {
  if (!monthStr || typeof monthStr !== 'string' || !MONTH_REGEX.test(monthStr)) {
    return monthStr || '';
  }
  const [year, month] = monthStr.split('-');
  const idx = Number.parseInt(month, 10) - 1;
  return `${HINDI_MONTHS[idx] || month} ${year}`;
}

export function formatDateTimeReadable(dateValue) {
  if (!dateValue) return '';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);
  return d.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
}

/**
 * Format a single field value from MongoDB into human-readable Hindi text (empty -> '').
 */
export function formatReadableFieldValue(field, rawValue) {
  if (!field || rawValue === undefined || rawValue === null || rawValue === '') {
    return '';
  }

  if (Array.isArray(rawValue)) {
    if (rawValue.length === 0) return '';
    return rawValue
      .map((code) => field.options?.[code] ?? field.options?.[Number(code)] ?? String(code))
      .join(', ');
  }

  if (field.options) {
    const mapped = field.options[rawValue] ?? field.options[Number(rawValue)];
    if (mapped !== undefined) {
      return field.type === 'rating' ? `${mapped} / 4` : mapped;
    }
  }

  if (field.type === 'month') {
    return formatMonthHindi(String(rawValue));
  }

  if (field.id === 51) {
    return `₹ ${rawValue}`;
  }

  return String(rawValue);
}

/**
 * Decode a compact DB record back into Hindi labels for emails, exports, and sheets.
 */
export function decodeCompactAnswers(compactAnswers = {}) {
  const decoded = {};
  for (const [key, val] of Object.entries(compactAnswers)) {
    const field = FORM_FIELDS[key];
    if (!field) continue;

    decoded[key] = {
      label: field.label,
      code: val,
      value: formatReadableFieldValue(field, val),
    };
  }
  return decoded;
}

/**
 * Organize a full submission (a + rv) into all 9 sections with decoded Hindi values.
 */
export function buildDecodedSectionsForSubmission(submission) {
  const a = submission?.a || {};
  const rv = submission?.rv || {};

  return SECTIONS.map((section) => ({
    id: section.id,
    title: section.title,
    sheetName: section.sheetName,
    fields: section.fieldIds.map((fieldId) => {
      const field = FORM_FIELDS[fieldId];
      const source = section.id === 9 ? rv : a;
      const rawVal = source[fieldId];
      return {
        id: fieldId,
        label: field.label,
        value: formatReadableFieldValue(field, rawVal),
      };
    }),
  }));
}
