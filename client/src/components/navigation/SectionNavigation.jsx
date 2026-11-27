import { ArrowLeft, ArrowRight, FileCheck2 } from 'lucide-react';
import { SECTIONS } from '../../schemas/formSchema.js';

export default function SectionNavigation({
  currentSection,
  onPrevious,
  onNext,
  onGoToReview,
}) {
  const totalSections = SECTIONS.length;
  const isFirst = currentSection <= 1;
  const isLast = currentSection >= totalSections;

  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors ${
          isFirst
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>पिछला भाग</span>
      </button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {currentSection === 8 && (
          <button
            type="button"
            onClick={onGoToReview}
            className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-900"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>समीक्षा और सबमिट पर जाएँ</span>
          </button>
        )}

        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
              currentSection === 8
                ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                : 'bg-emerald-800 text-white shadow-xs hover:bg-emerald-900'
            }`}
          >
            <span>
              {currentSection === 8
                ? 'भाग 9 : ज़िम्मेदार समीक्षा देखें'
                : 'अगला भाग'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onGoToReview}
            className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-900"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>अंतिम समीक्षा पर जाएँ</span>
          </button>
        )}
      </div>
    </div>
  );
}
