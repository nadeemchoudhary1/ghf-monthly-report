import { AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

export default function SaveStatusIndicator({
  status,
  error,
  lastSavedAt,
  hasDraftData,
  onRequestClear,
}) {
  const formattedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString('hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="flex items-center gap-2">
      <div
        data-save-status={status}
        className={`flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
          status === 'error'
            ? 'border-red-200 bg-red-50 text-red-800'
            : status === 'saving'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : status === 'saved'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}
        role="status"
        aria-live="polite"
        title={error || undefined}
      >
        {status === 'saving' && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>सहेजा जा रहा है...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
            <span>
              सहेजा गया{formattedTime ? ` (${formattedTime})` : ''}
            </span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-red-600" />
            <span>लोकल सेव त्रुटि</span>
          </>
        )}
        {status === 'idle' && <span>लोकल ऑटो-सेव सक्रिय</span>}
      </div>

      {hasDraftData && (
        <button
          type="button"
          onClick={onRequestClear}
          className="flex min-h-[36px] items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
          title="ब्राउज़र में सहेजा गया ड्राफ्ट साफ़ करें"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">ड्राफ्ट साफ़ करें</span>
        </button>
      )}
    </div>
  );
}
