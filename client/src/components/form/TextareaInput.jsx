export default function TextareaInput({ field, value = '', onChange }) {
  const inputId = `field-${field.id}`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold leading-snug text-slate-800"
      >
        {field.label}
      </label>

      {field.helperText && (
        <p className="text-xs text-slate-500">{field.helperText}</p>
      )}

      <textarea
        id={inputId}
        name={inputId}
        rows={field.rows || 3}
        value={value}
        placeholder={field.placeholder || ''}
        onChange={(e) => onChange(field.id, e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder-slate-400 transition-colors focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  );
}
