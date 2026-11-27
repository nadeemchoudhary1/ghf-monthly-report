export default function RadioGroup({ field, value, onChange, compact = false }) {
  const entries = Object.entries(field.options || {});

  return (
    <fieldset className="space-y-2">
      {!compact && (
        <legend className="text-sm font-semibold leading-snug text-slate-800">
          {field.label}
        </legend>
      )}

      {field.helperText && !compact && (
        <p className="text-xs text-slate-500">{field.helperText}</p>
      )}

      <div
        className={`grid gap-2 ${
          compact
            ? 'grid-cols-3'
            : entries.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : entries.length === 4
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-3'
        }`}
      >
        {entries.map(([codeStr, optionLabel]) => {
          const code = Number(codeStr);
          const isSelected = Number(value) === code;
          const optionId = `field-${field.id}-opt-${code}`;

          return (
            <label
              key={code}
              htmlFor={optionId}
              className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors select-none ${
                isSelected
                  ? 'border-emerald-700 bg-emerald-50 font-semibold text-emerald-950 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
              }`}
            >
              <input
                id={optionId}
                type="radio"
                name={`field-${field.id}`}
                value={code}
                checked={isSelected}
                onChange={() => onChange(field.id, code)}
                className="h-5 w-5 shrink-0 accent-emerald-700"
              />
              <span className="leading-snug">{optionLabel}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
