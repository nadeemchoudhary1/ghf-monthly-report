import { OPTION_SETS } from './answerMappings.js';

export const SCHEMA_VERSION = 1;
export const SECTION_9_ID = 9;
export const ASSESSMENT_MONTH_FIELD_ID = '2';

export const FORM_META = {
  organization: 'GUIDED HUMANITY FOUNDATION',
  shortOrg: 'GHF',
  title: 'मासिक तरबियती एवं कारकर्दगी जायज़ा फ़ॉर्म',
  subtitle: 'व्यक्तिगत जानकारी | इबादत | क़ुरआन | इल्मी तरबियत | मीटिंग | बैतुलमाल | आत्ममूल्यांकन',
  motto: 'ईमान • इस्लाह • इत्तेहाद • इस्तिक़ामत',
};

/**
 * Complete 9-section definition matching GHF_Monthly_Jaiza_Form_A4_Professional.pdf.
 */
export const SECTIONS = [
  {
    id: 1,
    number: 1,
    title: 'भाग 1 : साथी की व्यक्तिगत जानकारी',
    shortTitle: 'व्यक्तिगत जानकारी',
    description: 'अपनी बुनियादी व्यक्तिगत और तंज़ीमी जानकारी दर्ज करें।',
    isResponsibleOnly: false,
    fieldIds: ['1', '2', '3', '72', '4', '5', '6', '7'],
  },
  {
    id: 2,
    number: 2,
    title: 'भाग 2 : नमाज़ और व्यक्तिगत इबादत का जायज़ा',
    shortTitle: 'नमाज़ और इबादत',
    description: 'पाँच वक़्त की नमाज़, जमाअत, तिलावत और मुहासबा की स्थिति दर्ज करें।',
    isResponsibleOnly: false,
    fieldIds: ['8', '9', '10', '11', '12', '13', '14', '15'],
  },
  {
    id: 3,
    number: 3,
    title: 'भाग 3 : क़ुरआन का मुताला',
    shortTitle: 'क़ुरआन का मुताला',
    description: 'क़ुरआन मजीद के तर्जुमा, तफ़्हीम और अमली सीख से संबंधित विवरण।',
    isResponsibleOnly: false,
    fieldIds: ['16', '17', '18', '19', '20'],
  },
  {
    id: 4,
    number: 4,
    title: 'भाग 4 : निर्धारित सिलेबस का जायज़ा',
    shortTitle: 'निर्धारित सिलेबस',
    description: 'हर किताब के सामने अपनी स्थिति पर निशान लगाएँ और इस महीने की प्रगति लिखें।',
    isResponsibleOnly: false,
    fieldIds: [
      '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
      '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
      '41', '42', '43',
    ],
  },
  {
    id: 5,
    number: 5,
    title: 'भाग 5 : मरकज़ और मुक़ामी मीटिंग में भागीदारी',
    shortTitle: 'मीटिंग भागीदारी',
    description: 'मरकज़, मुक़ामी और सिटी लेवल की मीटिंग में आपकी उपस्थिति का विवरण।',
    isResponsibleOnly: false,
    fieldIds: ['44', '45', '46', '47', '48', '49'],
  },
  {
    id: 6,
    number: 6,
    title: 'भाग 6 : बैतुलमाल में योगदान',
    shortTitle: 'बैतुलमाल योगदान',
    description: 'GHF के बैतुलमाल में आपके नियमित योगदान का विवरण।',
    isResponsibleOnly: false,
    fieldIds: ['50', '51', '52'],
  },
  {
    id: 7,
    number: 7,
    title: 'भाग 7 : तरबियत और तंज़ीमी गतिविधियाँ',
    shortTitle: 'तरबियती गतिविधियाँ',
    description: 'तरबियती कार्यक्रमों, दावत/इस्लाह और संगठन की समझ से जुड़े प्रश्न।',
    isResponsibleOnly: false,
    fieldIds: ['53', '54', '55'],
  },
  {
    id: 8,
    number: 8,
    title: 'भाग 8 : स्वयं अपना जायज़ा',
    shortTitle: 'स्वयं अपना जायज़ा',
    description: 'आत्ममूल्यांकन, सुधार के सुझाव और अगले महीने के तीन प्रमुख लक्ष्य।',
    isResponsibleOnly: false,
    fieldIds: ['56', '57', '58', '59', '60', '61'],
  },
  {
    id: 9,
    number: 9,
    title: 'भाग 9 : ज़िम्मेदार की समीक्षा',
    shortTitle: 'ज़िम्मेदार की समीक्षा',
    description: 'यह भाग केवल अधिकृत GHF ज़िम्मेदार द्वारा समीक्षा एवं कार्ययोजना दर्ज करने के लिए है।',
    isResponsibleOnly: true,
    fieldIds: ['62', '63', '64', '65', '66', '67', '68', '69', '70', '71'],
  },
];

// Public user assessment sections (Sections 1-8; Section 9 is Admin-only)
export const PUBLIC_SECTIONS = SECTIONS.filter((s) => !s.isResponsibleOnly);

/**
 * Centralized schema keyed by stable numeric field ID (as string keys "1".."71").
 * Do not renumber existing IDs once Phase 2 backend is connected.
 */
export const FIELDS = {
  // Section 1: Personal Information
  '1': {
    id: 1,
    sectionId: 1,
    label: 'साथी का पूरा नाम',
    type: 'text',
    placeholder: 'पूरा नाम लिखें',
  },
  '2': {
    id: 2,
    sectionId: 1,
    label: 'जायज़े का महीना',
    type: 'month',
  },
  '3': {
    id: 3,
    sectionId: 1,
    label: 'मोबाइल नंबर',
    type: 'tel',
    placeholder: '10 अंकों का मोबाइल नंबर',
    inputMode: 'tel',
  },
  '4': {
    id: 4,
    sectionId: 1,
    label: 'शहर / इलाका',
    type: 'text',
    placeholder: 'शहर या इलाके का नाम',
  },
  '5': {
    id: 5,
    sectionId: 1,
    label: 'मरकज़ का नाम',
    type: 'text',
    placeholder: 'मरकज़ का नाम लिखें',
  },
  '6': {
    id: 6,
    sectionId: 1,
    // PDF text: "□□□ से जुड़ने की तारीख" (confirmed GHF)
    label: 'GHF से जुड़ने की तारीख',
    type: 'date',
  },
  '7': {
    id: 7,
    sectionId: 1,
    label: 'वर्तमान तंज़ीमी ज़िम्मेदारी',
    type: 'text',
    placeholder: 'यदि कोई ज़िम्मेदारी हो तो लिखें',
  },
  '72': {
    id: 72,
    sectionId: 1,
    label: 'ईमेल पता (वैकल्पिक)',
    type: 'email',
    placeholder: 'example@email.com (पुष्टि ईमेल के लिए)',
    inputMode: 'email',
  },

  // Section 2: Namaz & Personal Ibadat
  '8': {
    id: 8,
    sectionId: 2,
    group: 'namaz_table',
    label: 'फ़ज्र',
    type: 'radio',
    options: OPTION_SETS.NAMAZ_STATUS,
  },
  '9': {
    id: 9,
    sectionId: 2,
    group: 'namaz_table',
    label: 'ज़ुहर',
    type: 'radio',
    options: OPTION_SETS.NAMAZ_STATUS,
  },
  '10': {
    id: 10,
    sectionId: 2,
    group: 'namaz_table',
    label: 'अस्र',
    type: 'radio',
    options: OPTION_SETS.NAMAZ_STATUS,
  },
  '11': {
    id: 11,
    sectionId: 2,
    group: 'namaz_table',
    label: 'मग़रिब',
    type: 'radio',
    options: OPTION_SETS.NAMAZ_STATUS,
  },
  '12': {
    id: 12,
    sectionId: 2,
    group: 'namaz_table',
    label: 'इशा',
    type: 'radio',
    options: OPTION_SETS.NAMAZ_STATUS,
  },
  '13': {
    id: 13,
    sectionId: 2,
    group: 'ibadat_questions',
    label: 'क्या आप अधिकतर नमाज़ें जमाअत के साथ अदा करते हैं?',
    type: 'radio',
    options: OPTION_SETS.JAMAAT_FREQUENCY,
  },
  '14': {
    id: 14,
    sectionId: 2,
    group: 'ibadat_questions',
    label: 'क्या आप रोज़ाना कुरआन की तिलावत करते हैं?',
    type: 'radio',
    options: OPTION_SETS.TILAWAT_FREQUENCY,
  },
  '15': {
    id: 15,
    sectionId: 2,
    group: 'ibadat_questions',
    label: 'क्या आप अपने आमाल और किरदार का मुहासबा करते हैं?',
    type: 'radio',
    options: OPTION_SETS.REGULAR_SOMETIMES_NO,
  },

  // Section 3: Quran Mutala
  '16': {
    id: 16,
    sectionId: 3,
    label: 'क्या आप कुरआन मजीद का तर्जुमा और तफ़्हीम पढ़ रहे हैं?',
    type: 'radio',
    options: OPTION_SETS.QURAN_TAFHEEM_STATUS,
  },
  '17': {
    id: 17,
    sectionId: 3,
    label: 'इस महीने पढ़ी गई सूरह / पारा',
    type: 'text',
    placeholder: 'जैसे: सूरह बक़रा / पारा 2',
  },
  '18': {
    id: 18,
    sectionId: 3,
    label: 'आयतें (लगभग)',
    type: 'number',
    min: 0,
    placeholder: 'अनुमानित संख्या लिखें',
  },
  '19': {
    id: 19,
    sectionId: 3,
    label: 'अध्ययन की गई किताब / तफ़्सीर',
    type: 'text',
    placeholder: 'किताब या तफ़्सीर का नाम',
  },
  '20': {
    id: 20,
    sectionId: 3,
    label: 'मुताले से सीखी गई कोई बात जिसे अमल में लाने की कोशिश की:',
    type: 'textarea',
    rows: 3,
    placeholder: 'अपना अनुभव या अमली सबक़ लिखें...',
  },

  // Section 4: Prescribed Syllabus (20 Books + 3 Monthly Progress fields)
  '21': { id: 21, sectionId: 4, group: 'syllabus_books', label: '1. कुरआन (तर्जुमा / तफ़्हीम)', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '22': { id: 22, sectionId: 4, group: 'syllabus_books', label: '2. सहीह हदीस', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '23': { id: 23, sectionId: 4, group: 'syllabus_books', label: '3. तौहीद, रिसालत और आख़िरत के अक़्ली सबूत', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '24': { id: 24, sectionId: 4, group: 'syllabus_books', label: '4. जीवन मृत्यु के पश्चात', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '25': { id: 25, sectionId: 4, group: 'syllabus_books', label: '5. शांति मार्ग', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '26': { id: 26, sectionId: 4, group: 'syllabus_books', label: '6. इस्लाम और इंसान', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '27': { id: 27, sectionId: 4, group: 'syllabus_books', label: '7. सत्य धर्म', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '28': { id: 28, sectionId: 4, group: 'syllabus_books', label: '8. इस्लाम का नैतिक दृष्टिकोण', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '29': { id: 29, sectionId: 4, group: 'syllabus_books', label: '9. इस्लामी आंदोलन के नैतिक आधार', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '30': { id: 30, sectionId: 4, group: 'syllabus_books', label: '10. बनाव और बिगाड़', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '31': { id: 31, sectionId: 4, group: 'syllabus_books', label: '11. क़ुव्वत का असल राज़', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '32': { id: 32, sectionId: 4, group: 'syllabus_books', label: '12. शहादते हक़', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '33': { id: 33, sectionId: 4, group: 'syllabus_books', label: '13. इस्लाम की जीवन व्यवस्था', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '34': { id: 34, sectionId: 4, group: 'syllabus_books', label: '14. ख़ुतबात (मुकम्मल)', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '35': { id: 35, sectionId: 4, group: 'syllabus_books', label: '15. तहरीके इस्लामी कामयाबी की शर्तें', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '36': { id: 36, sectionId: 4, group: 'syllabus_books', label: '16. अहम हिदायतें', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  // Note: PDF rendered "17. नबी □ की सीरत (जीवनी / अर-रहीक़ुल मख़तूम)" where □ is a single missing glyph (flagged for verification).
  '37': { id: 37, sectionId: 4, group: 'syllabus_books', label: '17. नबी की सीरत (जीवनी / अर-रहीक़ुल मख़तूम)', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '38': { id: 38, sectionId: 4, group: 'syllabus_books', label: '18. हमारे आपसी ताल्लुक़ात', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '39': { id: 39, sectionId: 4, group: 'syllabus_books', label: '19. अपनी इस्लाह आप', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '40': { id: 40, sectionId: 4, group: 'syllabus_books', label: '20. ख़ुतबाए मद्रास', type: 'radio', options: OPTION_SETS.SYLLABUS_STATUS },
  '41': {
    id: 41,
    sectionId: 4,
    group: 'syllabus_progress',
    label: 'इस महीने मुकम्मल की गई किताब',
    type: 'text',
    placeholder: 'किताब का नाम लिखें',
  },
  '42': {
    id: 42,
    sectionId: 4,
    group: 'syllabus_progress',
    label: 'फ़िलहाल पढ़ी जा रही किताब',
    type: 'text',
    placeholder: 'किताब का नाम लिखें',
  },
  '43': {
    id: 43,
    sectionId: 4,
    group: 'syllabus_progress',
    label: 'अगले महीने पढ़ने का इरादा',
    type: 'text',
    placeholder: 'किताब का नाम लिखें',
  },

  // Section 5: Markaz & Muqami Meetings
  '44': {
    id: 44,
    sectionId: 5,
    group: 'markaz_meeting',
    groupTitle: '१. मरकज़ की मासिक मीटिंग',
    reviewLabel: 'मरकज़ की मासिक मीटिंग — आप कितनी मीटिंग में शामिल हुए?',
    helperText: 'एक महीने में कुल 4 मीटिंग होती हैं।',
    label: 'आप कितनी मीटिंग में शामिल हुए?',
    type: 'rating',
    options: OPTION_SETS.MEETING_ATTENDANCE_COUNT,
  },
  '45': {
    id: 45,
    sectionId: 5,
    group: 'markaz_meeting',
    reviewLabel: 'मरकज़ की मीटिंग में अनुपस्थित रहने का कारण',
    label: 'अनुपस्थित रहने का कारण:',
    type: 'text',
    placeholder: 'यदि कोई मीटिंग छूटी हो तो कारण लिखें',
  },
  '46': {
    id: 46,
    sectionId: 5,
    group: 'muqami_meeting',
    groupTitle: '२. मुक़ामी मीटिंग',
    reviewLabel: 'मुक़ामी मीटिंग — आप कितनी मीटिंग में शामिल हुए?',
    helperText: 'एक महीने में कुल 4 मीटिंग होती हैं।',
    label: 'आप कितनी मीटिंग में शामिल हुए?',
    type: 'rating',
    options: OPTION_SETS.MEETING_ATTENDANCE_COUNT,
  },
  '47': {
    id: 47,
    sectionId: 5,
    group: 'muqami_meeting',
    reviewLabel: 'मुक़ामी मीटिंग में अनुपस्थित रहने का कारण',
    label: 'अनुपस्थित रहने का कारण:',
    type: 'text',
    placeholder: 'यदि कोई मीटिंग छूटी हो तो कारण लिखें',
  },
  '48': {
    id: 48,
    sectionId: 5,
    group: 'city_meeting',
    groupTitle: '३. सिटी लेवल की बड़ी मीटिंग',
    reviewLabel: 'सिटी लेवल की बड़ी मीटिंग — क्या आप पिछली सिटी लेवल मीटिंग में शामिल हुए थे?',
    label: 'क्या आप पिछली सिटी लेवल मीटिंग में शामिल हुए थे?',
    type: 'radio',
    options: OPTION_SETS.YES_NO,
  },
  '49': {
    id: 49,
    sectionId: 5,
    group: 'city_meeting',
    reviewLabel: 'सिटी लेवल मीटिंग में शामिल न होने का कारण',
    label: 'शामिल नहीं हुए तो कारण:',
    type: 'text',
    placeholder: 'यदि शामिल नहीं हुए हों तो कारण लिखें',
  },

  // Section 6: Baitulmaal Contribution
  '50': {
    id: 50,
    sectionId: 6,
    // PDF text: "क्या आप नियमित रूप से □□□ के बैतुलमाल में योगदान करते हैं?" (confirmed GHF)
    label: 'क्या आप नियमित रूप से GHF के बैतुलमाल में योगदान करते हैं?',
    type: 'radio',
    options: OPTION_SETS.BAITULMAAL_FREQUENCY,
  },
  '51': {
    id: 51,
    sectionId: 6,
    label: 'इस महीने योगदान की राशि (₹)',
    type: 'number',
    min: 0,
    placeholder: 'राशि (₹ में)',
  },
  '52': {
    id: 52,
    sectionId: 6,
    label: 'योगदान न करने का कोई विशेष कारण:',
    type: 'text',
    placeholder: 'यदि कोई कारण हो तो लिखें',
  },

  // Section 7: Tarbiyati & Tanzeemi Activities
  '53': {
    id: 53,
    sectionId: 7,
    // PDF text: "क्या आप □□□ के निर्धारित तरबियती कार्यक्रमों में भाग लेते हैं?" (confirmed GHF)
    label: 'क्या आप GHF के निर्धारित तरबियती कार्यक्रमों में भाग लेते हैं?',
    type: 'radio',
    options: OPTION_SETS.REGULAR_SOMETIMES_NO,
  },
  '54': {
    id: 54,
    sectionId: 7,
    label: 'क्या इस महीने किसी दावत, इस्लाह या सामाजिक गतिविधि में शामिल हुए?',
    type: 'radio',
    options: OPTION_SETS.YES_NO,
  },
  '55': {
    id: 55,
    sectionId: 7,
    label: 'क्या आप संगठन के उद्देश्य, मिशन और कार्यपद्धति को समझते हैं?',
    type: 'radio',
    options: OPTION_SETS.UNDERSTANDING_LEVEL,
  },

  // Section 8: Self Evaluation
  '56': {
    id: 56,
    sectionId: 8,
    label: '1. इस महीने आपने अपनी ज़िंदगी में कौन-सी अच्छी तब्दीली लाने की कोशिश की?',
    type: 'textarea',
    rows: 3,
    placeholder: 'अपना उत्तर लिखें...',
  },
  '57': {
    id: 57,
    sectionId: 8,
    label: '2. इस महीने आपकी सबसे बड़ी कमी या कमज़ोरी क्या रही?',
    type: 'textarea',
    rows: 3,
    placeholder: 'अपना उत्तर लिखें...',
  },
  '58': {
    id: 58,
    sectionId: 8,
    // PDF text: "3. □□□ की तरबियत और तंज़ीमी व्यवस्था में आप क्या सुधार चाहते हैं?" (confirmed GHF)
    label: '3. GHF की तरबियत और तंज़ीमी व्यवस्था में आप क्या सुधार चाहते हैं?',
    type: 'textarea',
    rows: 3,
    placeholder: 'अपने सुझाव लिखें...',
  },
  '59': {
    id: 59,
    sectionId: 8,
    group: 'next_month_goals',
    label: 'लक्ष्य 1',
    type: 'text',
    placeholder: 'पहला प्रमुख लक्ष्य लिखें',
  },
  '60': {
    id: 60,
    sectionId: 8,
    group: 'next_month_goals',
    label: 'लक्ष्य 2',
    type: 'text',
    placeholder: 'दूसरा प्रमुख लक्ष्य लिखें',
  },
  '61': {
    id: 61,
    sectionId: 8,
    group: 'next_month_goals',
    label: 'लक्ष्य 3',
    type: 'text',
    placeholder: 'तीसरा प्रमुख लक्ष्य लिखें',
  },

  // Section 9: Responsible Person Review (Visually Separate)
  '62': {
    id: 62,
    sectionId: 9,
    group: 'review_grid',
    label: 'नमाज़ और व्यक्तिगत इबादत',
    type: 'textarea',
    rows: 2,
    placeholder: 'ज़िम्मेदार की टिप्पणी...',
  },
  '63': {
    id: 63,
    sectionId: 9,
    group: 'review_grid',
    label: 'इल्मी मुताले और सिलेबस की प्रगति',
    type: 'textarea',
    rows: 2,
    placeholder: 'ज़िम्मेदार की टिप्पणी...',
  },
  '64': {
    id: 64,
    sectionId: 9,
    group: 'review_grid',
    label: 'मीटिंग में भागीदारी',
    type: 'textarea',
    rows: 2,
    placeholder: 'ज़िम्मेदार की टिप्पणी...',
  },
  '65': {
    id: 65,
    sectionId: 9,
    group: 'review_grid',
    label: 'बैतुलमाल में योगदान',
    type: 'textarea',
    rows: 2,
    placeholder: 'ज़िम्मेदार की टिप्पणी...',
  },
  '66': {
    id: 66,
    sectionId: 9,
    group: 'review_grid',
    label: 'साथी की प्रमुख खूबियाँ',
    type: 'textarea',
    rows: 2,
    placeholder: 'प्रमुख खूबियाँ लिखें...',
  },
  '67': {
    id: 67,
    sectionId: 9,
    group: 'review_grid',
    label: 'सुधार के लिए विशेष हिदायत',
    type: 'textarea',
    rows: 2,
    placeholder: 'विशेष हिदायत लिखें...',
  },
  '68': {
    id: 68,
    sectionId: 9,
    group: 'review_plan',
    label: 'अगले महीने की कार्ययोजना',
    type: 'textarea',
    rows: 3,
    placeholder: 'अगले महीने की कार्ययोजना लिखें...',
  },
  '69': {
    id: 69,
    sectionId: 9,
    group: 'review_signatures',
    label: 'साथी के हस्ताक्षर',
    type: 'text',
    placeholder: 'हस्ताक्षर / नाम',
  },
  '70': {
    id: 70,
    sectionId: 9,
    group: 'review_signatures',
    label: 'ज़िम्मेदार के हस्ताक्षर',
    type: 'text',
    placeholder: 'हस्ताक्षर / नाम',
  },
  '71': {
    id: 71,
    sectionId: 9,
    group: 'review_signatures',
    label: 'जायज़े की तारीख',
    type: 'date',
  },
};

export function getSectionById(sectionId) {
  return SECTIONS.find((s) => s.id === Number(sectionId)) ?? SECTIONS[0];
}

export function getSectionFields(sectionId) {
  const section = getSectionById(sectionId);
  return section.fieldIds.map((id) => FIELDS[id]).filter(Boolean);
}

export function isFieldAnswered(value) {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

export function getSectionAnsweredCount(sectionId, answers = {}) {
  const section = getSectionById(sectionId);
  return section.fieldIds.reduce((count, id) => {
    return count + (isFieldAnswered(answers[id]) ? 1 : 0);
  }, 0);
}

export function getFormSchemaStats() {
  const allFields = Object.values(FIELDS);
  const mcTypes = new Set(['radio', 'checkbox', 'rating']);
  const multipleChoiceCount = allFields.filter((f) => mcTypes.has(f.type)).length;
  const textareaCount = allFields.filter((f) => f.type === 'textarea').length;
  return {
    totalSections: SECTIONS.length,
    totalFields: allFields.length,
    multipleChoiceCount,
    descriptiveAndInputCount: allFields.length - multipleChoiceCount,
    textareaCount,
  };
}
