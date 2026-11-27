export default function NumericRating({ field, value, onChange }) {
  const entries = Object.entries(field.options || {});

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold leading-snug text-slate-800">
        {field.label}
      </legend>

      {field.helperText && (
        <p className="text-xs text-slate-500">{field.helperText}</p>
      )}

      <div className="flex flex-wrap gap-2.5">
        {entries.map(([codeStr, optionLabel]) => {
          const code = Number(codeStr);
          const isSelected = value !== undefined && value !== null && Number(value) === code;
          const optionId = `field-${field.id}-rate-${code}`;

          return (
            <label
              key={code}
              htmlFor={optionId}
              className={`flex min-h-[48px] min-w-[54px] cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-base font-bold transition-colors select-none ${
                isSelected
                  ? 'border-emerald-800 bg-emerald-800 text-white shadow-xs'
                  : 'border-slate-300 bg-white text-slate-800 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              <input
                id={optionId}
                type="radio"
                name={`field-${field.id}`}
                value={code}
                checked={isSelected}
                onChange={() => onChange(field.id, code)}
                className="sr-only"
              />
              <span>{optionLabel}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
