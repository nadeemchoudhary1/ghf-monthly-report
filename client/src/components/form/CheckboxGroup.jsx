export default function CheckboxGroup({ field, value = [], onChange }) {
  const entries = Object.entries(field.options || {});
  const selectedCodes = Array.isArray(value) ? value.map(Number) : [];

  const handleToggle = (code) => {
    const exists = selectedCodes.includes(code);
    const next = exists
      ? selectedCodes.filter((c) => c !== code)
      : [...selectedCodes, code];
    onChange(field.id, next);
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold leading-snug text-slate-800">
        {field.label}
      </legend>

      {field.helperText && (
        <p className="text-xs text-slate-500">{field.helperText}</p>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([codeStr, optionLabel]) => {
          const code = Number(codeStr);
          const isChecked = selectedCodes.includes(code);
          const optionId = `field-${field.id}-chk-${code}`;

          return (
            <label
              key={code}
              htmlFor={optionId}
              className={`flex min-h-[46px] cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors select-none ${
                isChecked
                  ? 'border-emerald-700 bg-emerald-50 font-semibold text-emerald-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
              }`}
            >
              <input
                id={optionId}
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(code)}
                className="h-5 w-5 shrink-0 rounded accent-emerald-700"
              />
              <span className="leading-snug">{optionLabel}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
