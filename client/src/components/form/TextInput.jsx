export default function TextInput({ field, value = '', error, onChange }) {
  const inputId = `field-${field.id}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-slate-800"
      >
        {field.label}
      </label>

      {field.helperText && (
        <p className="text-xs text-slate-500">{field.helperText}</p>
      )}

      <input
        id={inputId}
        name={inputId}
        type={field.type === 'number' ? 'number' : field.type}
        inputMode={field.inputMode}
        min={field.min}
        max={field.max}
        value={value}
        placeholder={field.placeholder || ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        className={`min-h-[46px] w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
          error
            ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200'
            : 'border-slate-300 focus:border-emerald-700 focus:ring-emerald-200'
        }`}
      />

      {error && (
        <p className="text-xs font-medium text-amber-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
