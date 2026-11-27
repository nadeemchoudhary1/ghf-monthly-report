import { Check, Lock } from 'lucide-react';
import { getSectionAnsweredCount, SECTIONS } from '../../schemas/formSchema.js';

export default function ProgressBar({
  currentSection,
  answers,
  onSelectSection,
  onGoToReview,
}) {
  const totalSections = SECTIONS.length;
  const stepPercentage = Math.round((currentSection / totalSections) * 100);

  const totalFields = SECTIONS.reduce((sum, s) => sum + s.fieldIds.length, 0);
  const totalAnswered = SECTIONS.reduce(
    (sum, s) => sum + getSectionAnsweredCount(s.id, answers),
    0
  );
  const completionPercentage = Math.round((totalAnswered / totalFields) * 100);

  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-emerald-800 uppercase">
            भाग {currentSection} / {totalSections}
          </p>
          <p className="text-sm font-bold text-slate-900 sm:text-base">
            {SECTIONS[currentSection - 1]?.title}
          </p>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-xs text-slate-500">चरण प्रगति</p>
            <p className="text-sm font-bold text-emerald-800">{stepPercentage}%</p>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <p className="text-xs text-slate-500">भरे गए प्रश्न</p>
            <p className="text-sm font-bold text-slate-800">
              {totalAnswered}/{totalFields} ({completionPercentage}%)
            </p>
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-emerald-700 transition-all duration-300"
          style={{ width: `${stepPercentage}%` }}
        />
      </div>

      {/* Step Pills */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
        {SECTIONS.map((section) => {
          const isCurrent = section.id === currentSection;
          const answeredCount = getSectionAnsweredCount(section.id, answers);
          const isStarted = answeredCount > 0;
          const isComplete = answeredCount === section.fieldIds.length;

          if (section.isResponsibleOnly) {
            return (
              <div key={section.id} className="flex shrink-0 items-center gap-2">
                <div className="h-6 w-px bg-slate-200" />
                <button
                  type="button"
                  onClick={() => onSelectSection(section.id)}
                  className={`flex min-h-[38px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                      : 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>9. {section.shortTitle}</span>
                </button>
              </div>
            );
          }

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
              className={`flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isCurrent
                  ? 'border-emerald-800 bg-emerald-800 text-white shadow-xs'
                  : isComplete
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                    : isStarted
                      ? 'border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {isComplete && !isCurrent ? (
                <Check className="h-3.5 w-3.5 text-emerald-700" />
              ) : (
                <span>{section.number}. </span>
              )}
              <span>{section.shortTitle}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onGoToReview}
          className="flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border border-emerald-700 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-50"
        >
          <span>अंतिम समीक्षा</span>
        </button>
      </div>
    </div>
  );
}
