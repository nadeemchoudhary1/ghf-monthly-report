import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Lock,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatFieldAnswer } from '../schemas/answerMappings.js';
import {
  FIELDS,
  FORM_META,
  getSectionAnsweredCount,
  SECTIONS,
} from '../schemas/formSchema.js';
import PrivacyNotice from '../components/layout/PrivacyNotice.jsx';

export default function Home({
  answers,
  currentSection,
  hasDraftData,
  lastSavedAt,
  onSelectSection,
  onRequestClearDraft,
}) {
  const navigate = useNavigate();

  const totalFields = SECTIONS.reduce((sum, s) => sum + s.fieldIds.length, 0);
  const totalAnswered = SECTIONS.reduce(
    (sum, s) => sum + getSectionAnsweredCount(s.id, answers),
    0
  );

  const partnerName = answers['1'] || '';
  const monthLabel = formatFieldAnswer(FIELDS['2'], answers['2']);

  const handleStartOrResume = () => {
    navigate('/form');
  };

  const handleOpenSection = (sectionId) => {
    onSelectSection(sectionId);
    navigate('/form');
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <section className="overflow-hidden rounded-2xl border border-emerald-900/15 bg-white shadow-xs">
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-5 py-6 text-white sm:px-8 sm:py-8">
          <p className="text-xs font-bold tracking-widest text-emerald-200 uppercase">
            {FORM_META.organization}
          </p>
          <h2 className="mt-1.5 text-2xl font-bold leading-tight sm:text-3xl">
            {FORM_META.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-100">
            साथियों की मासिक इबादत, क़ुरआन मुताला, निर्धारित सिलेबस, मीटिंग भागीदारी,
            बैतुलमाल योगदान और तंज़ीमी आत्ममूल्यांकन का व्यवस्थित डिजिटल पोर्टल।
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-8">
          {hasDraftData && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    <span>आपका अधूरा ड्राफ्ट ब्राउज़र में सुरक्षित है</span>
                  </div>
                  <p className="text-xs text-emerald-900 sm:text-sm">
                    {partnerName ? `साथी: ${partnerName} • ` : ''}
                    {monthLabel ? `महीना: ${monthLabel} • ` : ''}
                    अंतिम भाग: भाग {currentSection} • भरे गए प्रश्न: {totalAnswered}/{totalFields}
                    {lastSavedAt
                      ? ` • अंतिम सेव: ${new Date(lastSavedAt).toLocaleString('hi-IN')}`
                      : ''}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onRequestClearDraft}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>ड्राफ्ट साफ़ करें</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleStartOrResume}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-900 sm:text-base"
            >
              <ClipboardList className="h-5 w-5" />
              <span>
                {hasDraftData
                  ? `जायज़ा फ़ॉर्म जारी रखें (भाग ${currentSection})`
                  : 'मासिक जायज़ा फ़ॉर्म शुरू करें'}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {hasDraftData && (
              <button
                type="button"
                onClick={() => navigate('/review')}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-emerald-700 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 transition-colors hover:bg-emerald-50"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>समीक्षा पृष्ठ देखें</span>
              </button>
            )}
          </div>

          <PrivacyNotice />
        </div>
      </section>

      {/* Sections Overview */}
      <section className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
            फ़ॉर्म के सभी 9 भाग
          </h3>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {totalAnswered}/{totalFields} उत्तर दर्ज
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((section) => {
            const answered = getSectionAnsweredCount(section.id, answers);
            const total = section.fieldIds.length;
            const isComplete = answered === total;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleOpenSection(section.id)}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-colors ${
                  section.isResponsibleOnly
                    ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50'
                    : isComplete
                      ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                      : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold ${
                        section.isResponsibleOnly
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {section.isResponsibleOnly && <Lock className="h-3 w-3" />}
                      भाग {section.number}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {answered}/{total}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-slate-900">
                    {section.shortTitle}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
