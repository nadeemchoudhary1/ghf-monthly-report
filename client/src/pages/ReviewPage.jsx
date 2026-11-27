import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Code2,
  Edit3,
  Loader2,
  Lock,
  RefreshCw,
  Send,
  WifiOff,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PrivacyNotice from '../components/layout/PrivacyNotice.jsx';
import { formatFieldAnswer } from '../schemas/answerMappings.js';
import {
  FIELDS,
  getSectionAnsweredCount,
  getSectionFields,
  SCHEMA_VERSION,
  SECTION_9_ID,
  SECTIONS,
} from '../schemas/formSchema.js';
import { buildSubmissionPayload } from '../services/submissionService.js';
import { getReviewAdvisories, validateAllAnswers } from '../utils/formValidation.js';

export default function ReviewPage({
  draft,
  answers,
  pendingItems,
  isSubmitting,
  retryingSid,
  submissionError,
  confirmedReceipt,
  onSelectSection,
  onSubmitForm,
  onRetryPending,
  onClearReceipt,
}) {
  const navigate = useNavigate();
  const [showPayload, setShowPayload] = useState(false);

  const advisories = getReviewAdvisories(answers);
  const formatErrors = validateAllAnswers(answers);
  const formatErrorList = Object.entries(formatErrors);

  const partnerSections = SECTIONS.filter((s) => !s.isResponsibleOnly);
  const responsibleSection = SECTIONS.find((s) => s.id === SECTION_9_ID);
  const responsibleAnswered = getSectionAnsweredCount(SECTION_9_ID, answers);

  const handleEditSection = (sectionId) => {
    onSelectSection(sectionId);
    navigate('/form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartFresh = () => {
    onClearReceipt();
    onSelectSection(1);
    navigate('/form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dedicated Success View after confirmed backend acknowledgement
  if (confirmedReceipt) {
    return (
      <div className="space-y-6">
        <section
          className="rounded-2xl border border-emerald-300 bg-white p-6 shadow-xs sm:p-8"
          role="status"
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <h2 className="mt-4 text-2xl font-bold text-emerald-950">
              {confirmedReceipt.status === 'already_submitted'
                ? 'आपका जायज़ा पहले ही सुरक्षित रूप से दर्ज हो चुका है'
                : 'आपका मासिक जायज़ा सफलतापूर्वक सबमिट हो गया!'}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              सर्वर और डेटाबेस से पुष्टि प्राप्त हो चुकी है। आपका ब्राउज़र ड्राफ्ट साफ़ कर दिया
              गया है। भविष्य के संदर्भ के लिए अपनी सबमिशन आईडी सुरक्षित रखें।
            </p>

            <div className="mt-6 w-full max-w-md rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-left text-sm">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">सबमिशन आईडी (SID):</span>
                <span className="font-mono font-bold text-emerald-950">
                  {confirmedReceipt.sid}
                </span>
              </div>
              {confirmedReceipt.month && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">जायज़े का महीना:</span>
                  <span className="font-semibold text-slate-900">
                    {formatFieldAnswer(FIELDS['2'], confirmedReceipt.month)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-slate-600">पुष्टि समय:</span>
                <span className="font-medium text-slate-800">
                  {new Date(confirmedReceipt.confirmedAt).toLocaleString('hi-IN')}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  onClearReceipt();
                  navigate('/');
                }}
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                होम पेज पर जाएँ
              </button>
              <button
                type="button"
                onClick={handleStartFresh}
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-900"
              >
                नया जायज़ा फ़ॉर्म भरें
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-2xl border border-emerald-900/15 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-wide text-emerald-800 uppercase">
              अंतिम समीक्षा एवं सबमिशन
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              दर्ज किए गए उत्तरों की समीक्षा करें
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              किसी भी भाग में सुधार करने के लिए &quot;संपादित करें&quot; बटन पर क्लिक करें।
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleEditSection(8)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>फ़ॉर्म पर वापस जाएँ</span>
          </button>
        </div>

        {(advisories.length > 0 || formatErrorList.length > 0) && (
          <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              <span>समीक्षा सुझाव</span>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-xs sm:text-sm">
              {advisories.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
              {formatErrorList.map(([id, msg]) => (
                <li key={id}>
                  {FIELDS[id]?.label}: {msg}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Sections 1–8 Summary */}
      <div className="space-y-4">
        {partnerSections.map((section) => {
          const fields = getSectionFields(section.id);
          const answeredCount = getSectionAnsweredCount(section.id, answers);

          return (
            <section
              key={section.id}
              className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-emerald-950 sm:text-lg">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    भरे गए उत्तर: {answeredCount} / {fields.length}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleEditSection(section.id)}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>संपादित करें</span>
                </button>
              </div>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {fields.map((field) => {
                  const rawVal = answers[String(field.id)];
                  const displayVal = formatFieldAnswer(field, rawVal);
                  const isWide = field.type === 'textarea';

                  return (
                    <div
                      key={field.id}
                      className={`rounded-xl border border-slate-100 bg-slate-50/60 p-3 ${
                        isWide ? 'sm:col-span-2' : ''
                      }`}
                    >
                      <dt className="text-xs font-semibold text-slate-500">
                        {field.reviewLabel || field.label}
                      </dt>
                      <dd
                        className={`mt-1 text-sm whitespace-pre-line ${
                          displayVal
                            ? 'font-medium text-slate-900'
                            : 'italic text-slate-400'
                        }`}
                      >
                        {displayVal || 'उत्तर दर्ज नहीं किया गया'}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          );
        })}
      </div>

      {/* Section 9 Visually Separate Status Card */}
      {responsibleSection && (
        <section className="rounded-2xl border-2 border-amber-400/80 bg-amber-50/30 p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                <Lock className="h-3 w-3" />
                अधिकृत GHF ज़िम्मेदार समीक्षा स्थिति
              </span>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                {responsibleSection.title}
              </h3>
              <p className="text-xs text-slate-600 sm:text-sm">
                स्थिति:{' '}
                <span className="font-semibold text-amber-900">
                  {responsibleAnswered > 0
                    ? `स्थानीय प्रविष्टियाँ (${responsibleAnswered}/${responsibleSection.fieldIds.length}) — सार्वजनिक सबमिशन में शामिल नहीं`
                    : 'लंबित — यह भाग अधिकृत GHF ज़िम्मेदार द्वारा समीक्षा चरण में भरा जाएगा'}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleEditSection(SECTION_9_ID)}
              className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-50 sm:text-sm"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>भाग 9 देखें / खोलें</span>
            </button>
          </div>
        </section>
      )}

      {/* Backend Submission & Pending Retry Queue Card */}
      <section className="rounded-2xl border border-emerald-900/15 bg-white p-5 shadow-xs sm:p-6">
        <div className="space-y-4">
          {submissionError && (
            <div
              className={`rounded-xl border p-4 text-sm ${
                submissionError.kind === 'validation_error'
                  ? 'border-red-300 bg-red-50 text-red-950'
                  : 'border-amber-300 bg-amber-50 text-amber-950'
              }`}
              role="alert"
            >
              <div className="flex items-start gap-2.5">
                {submissionError.kind === 'validation_error' ? (
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                ) : (
                  <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                )}
                <div className="space-y-1">
                  <p className="font-bold">
                    {submissionError.kind === 'validation_error'
                      ? 'कृपया फ़ॉर्म की जानकारी जांचें'
                      : 'सबमिशन अस्थायी रूप से लंबित है (डेटा सुरक्षित है)'}
                  </p>
                  <p className="text-xs leading-relaxed sm:text-sm">
                    {submissionError.message}
                  </p>
                  {submissionError.errors?.length > 1 && (
                    <ul className="list-disc pl-5 text-xs">
                      {submissionError.errors.map((err) => (
                        <li key={err}>{err}</li>
                      ))}
                    </ul>
                  )}
                  {submissionError.kind === 'validation_error' && (
                    <button
                      type="button"
                      onClick={() => handleEditSection(1)}
                      className="mt-2 inline-flex min-h-[36px] items-center rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-50"
                    >
                      भाग 1 पर जाएँ
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {pendingItems.length > 0 && (
            <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50/70 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-950">
                <Clock className="h-4 w-4 text-amber-700" />
                <span>
                  लंबित सबमिशन कतार ({pendingItems.length}) — इंटरनेट जुड़ने पर स्वतः पुनः भेजा जाएगा
                </span>
              </div>

              <div className="space-y-2">
                {pendingItems.map((item) => {
                  const isRetryingThis = retryingSid === item.sid;
                  return (
                    <div
                      key={item.sid}
                      className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-white p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-0.5">
                        <p className="font-mono font-bold text-slate-900">
                          {item.sid}
                        </p>
                        <p className="text-slate-600">
                          महीना: {formatFieldAnswer(FIELDS['2'], item.payload.month)} •
                          प्रयास: {item.retryCount}
                          {item.lastError ? ` • ${item.lastError}` : ''}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isRetryingThis}
                        onClick={() => onRetryPending(item.sid)}
                        className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${isRetryingThis ? 'animate-spin' : ''}`}
                        />
                        <span>
                          {isRetryingThis ? 'भेजा जा रहा है...' : 'पुनः प्रयास करें'}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setShowPayload((v) => !v)}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Code2 className="h-4 w-4" />
              <span>
                {showPayload ? 'डेटा पेलोड छिपाएँ' : 'कॉम्पैक्ट डेटा पेलोड देखें'}
              </span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitForm(answers)}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>सर्वर पर भेजा जा रहा है...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>जायज़ा सबमिट करें</span>
                </>
              )}
            </button>
          </div>

          {isSubmitting && (
            <p className="text-xs text-slate-500">
              कृपया प्रतीक्षा करें — यदि सर्वर पहली बार सक्रिय हो रहा है तो इसमें कुछ सेकंड लग सकते हैं।
            </p>
          )}
        </div>

        {showPayload && (
          <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-emerald-200">
            {JSON.stringify(
              {
                ...buildSubmissionPayload(answers, 'GHF-PREVIEW-SID'),
                sv: SCHEMA_VERSION,
                month: draft.assessmentMonth || answers['2'] || '',
              },
              null,
              2
            )}
          </pre>
        )}
      </section>

      <PrivacyNotice />
    </div>
  );
}
