/**
 * Centralized numeric answer mappings for the GHF Monthly Tarbiyati & Karkun Jaiza Form.
 * Option codes are stored as numbers (or arrays of numbers for checkboxes) so that
 * Phase 2 backend synchronization uses compact, language-independent numeric codes.
 */

export const OPTION_SETS = {
  NAMAZ_STATUS: {
    1: 'नियमित',
    2: 'कभी-कभी छूटती है',
    3: 'अक्सर छूटती है',
  },
  JAMAAT_FREQUENCY: {
    1: 'लगभग हमेशा',
    2: 'अक्सर',
    3: 'कभी-कभी',
    4: 'बहुत कम',
  },
  TILAWAT_FREQUENCY: {
    1: 'रोज़ाना',
    2: 'सप्ताह में 4–5 दिन',
    3: '1–3 दिन',
    4: 'बहुत कम',
  },
  REGULAR_SOMETIMES_NO: {
    1: 'नियमित',
    2: 'कभी-कभी',
    3: 'नहीं',
  },
  QURAN_TAFHEEM_STATUS: {
    1: 'हाँ, नियमित',
    2: 'कभी-कभी',
    3: 'अभी शुरू नहीं किया',
  },
  SYLLABUS_STATUS: {
    1: 'मुकम्मल',
    2: 'जारी',
    3: 'शुरू नहीं',
  },
  MEETING_ATTENDANCE_COUNT: {
    0: '0',
    1: '1',
    2: '2',
    3: '3',
    4: '4',
  },
  YES_NO: {
    1: 'हाँ',
    2: 'नहीं',
  },
  BAITULMAAL_FREQUENCY: {
    1: 'हर महीने',
    2: 'कभी-कभी',
    3: 'अभी तक शुरू नहीं किया',
  },
  UNDERSTANDING_LEVEL: {
    1: 'पूरी तरह',
    2: 'कुछ हद तक',
    3: 'और समझने की ज़रूरत है',
  },
};

/**
 * Resolve a stored numeric option code (or array of codes) into human-readable Hindi labels.
 * @param {object} field - Field definition from formSchema
 * @param {string|number|number[]|null|undefined} value - Stored field value
 * @returns {string}
 */
export function formatFieldAnswer(field, value) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return value
      .map((code) => field?.options?.[code] ?? String(code))
      .join(', ');
  }

  if (field?.options) {
    const mapped = field.options[value] ?? field.options[Number(value)];
    if (mapped !== undefined) {
      return field.type === 'rating' ? `${mapped} / 4` : mapped;
    }
  }

  if (field?.type === 'month' && typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-');
    const months = [
      'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
    ];
    const mIndex = parseInt(month, 10) - 1;
    return `${months[mIndex] ?? month} ${year}`;
  }

  if (field?.id === 51 && value !== '') {
    return `₹ ${value}`;
  }

  return String(value);
}
