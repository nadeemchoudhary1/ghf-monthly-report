import { Lock, ShieldAlert } from 'lucide-react';
import { OPTION_SETS } from '../../schemas/answerMappings.js';
import { getSectionById, getSectionFields } from '../../schemas/formSchema.js';
import FieldRenderer from './FieldRenderer.jsx';

function NamazMatrix({ fields, answers, onChange }) {
  const columns = Object.entries(OPTION_SETS.NAMAZ_STATUS);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-emerald-950">
        पाँच वक़्त की नमाज़ की स्थिति दर्ज करें:
      </h3>

      {/* Desktop / Tablet Matrix */}
      <div className="hidden overflow-hidden rounded-xl border border-emerald-900/15 bg-white md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-emerald-50 text-emerald-950">
              <th className="border-b border-emerald-900/10 px-4 py-3 text-left font-bold">
                नमाज़
              </th>
              {columns.map(([code, label]) => (
                <th
                  key={code}
                  className="border-b border-emerald-900/10 px-4 py-3 text-center font-bold"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => {
              const selected = answers[String(field.id)];
              return (
                <tr
                  key={field.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/30"
                >
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {field.label}
                  </td>
                  {columns.map(([codeStr]) => {
                    const code = Number(codeStr);
                    const isChecked = Number(selected) === code;
                    const inputId = `matrix-${field.id}-${code}`;
                    return (
                      <td key={code} className="px-4 py-2 text-center">
                        <label
                          htmlFor={inputId}
                          className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-lg hover:bg-emerald-50"
                        >
                          <input
                            id={inputId}
                            type="radio"
                            name={`field-${field.id}`}
                            checked={isChecked}
                            onChange={() => onChange(field.id, code)}
                            aria-label={`${field.label} - ${field.options[code]}`}
                            className="h-5 w-5 cursor-pointer accent-emerald-700"
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {fields.map((field) => (
          <div
            key={field.id}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5"
          >
            <FieldRenderer
              field={field}
              value={answers[String(field.id)]}
              onChange={onChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SyllabusSection({ fields, answers, errors, onChange }) {
  const bookFields = fields.filter((f) => f.group === 'syllabus_books');
  const progressFields = fields.filter((f) => f.group === 'syllabus_progress');

  return (
    <div className="space-y-6">
      <p className="text-sm font-semibold text-emerald-950">
        हर किताब के सामने अपनी स्थिति पर निशान लगाएँ।
      </p>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {bookFields.map((field) => {
          const selected = answers[String(field.id)];
          const entries = Object.entries(field.options || {});

          return (
            <div
              key={field.id}
              className="flex flex-col justify-between gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs"
            >
              <p className="text-sm font-semibold text-slate-900">
                {field.label}
              </p>

              <div className="grid grid-cols-3 gap-1.5">
                {entries.map(([codeStr, optLabel]) => {
                  const code = Number(codeStr);
                  const isSelected = Number(selected) === code;
                  const inputId = `book-${field.id}-opt-${code}`;
                  return (
                    <label
                      key={code}
                      htmlFor={inputId}
                      className={`flex min-h-[42px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-center text-xs font-medium transition-colors select-none sm:text-sm ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-700 font-semibold text-white shadow-2xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <input
                        id={inputId}
                        type="radio"
                        name={`field-${field.id}`}
                        checked={isSelected}
                        onChange={() => onChange(field.id, code)}
                        className="sr-only"
                      />
                      <span>{optLabel}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-emerald-900/15 bg-emerald-50/50 p-4 sm:p-5">
        <h3 className="mb-4 text-sm font-bold text-emerald-950 sm:text-base">
          इस महीने की सिलेबस प्रगति
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {progressFields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={answers[String(field.id)]}
              error={errors[String(field.id)]}
              onChange={onChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SectionRenderer({
  sectionId,
  answers,
  errors = {},
  onChange,
}) {
  const section = getSectionById(sectionId);
  const fields = getSectionFields(sectionId);

  const renderSectionBody = () => {
    if (section.id === 1) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id}>
              <FieldRenderer
                field={field}
                value={answers[String(field.id)]}
                error={errors[String(field.id)]}
                onChange={onChange}
              />
            </div>
          ))}
        </div>
      );
    }

    if (section.id === 2) {
      const prayerFields = fields.filter((f) => f.group === 'namaz_table');
      const otherFields = fields.filter((f) => f.group !== 'namaz_table');

      return (
        <div className="space-y-6">
          <NamazMatrix
            fields={prayerFields}
            answers={answers}
            onChange={onChange}
          />
          <div className="space-y-4">
            {otherFields.map((field) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
              >
                <FieldRenderer
                  field={field}
                  value={answers[String(field.id)]}
                  error={errors[String(field.id)]}
                  onChange={onChange}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section.id === 3) {
      const first = fields[0];
      const middle = fields.slice(1, 4);
      const last = fields[4];

      return (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <FieldRenderer
              field={first}
              value={answers[String(first.id)]}
              error={errors[String(first.id)]}
              onChange={onChange}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {middle.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={answers[String(field.id)]}
                error={errors[String(field.id)]}
                onChange={onChange}
              />
            ))}
          </div>
          <FieldRenderer
            field={last}
            value={answers[String(last.id)]}
            error={errors[String(last.id)]}
            onChange={onChange}
          />
        </div>
      );
    }

    if (section.id === 4) {
      return (
        <SyllabusSection
          fields={fields}
          answers={answers}
          errors={errors}
          onChange={onChange}
        />
      );
    }

    if (section.id === 5) {
      const groups = ['markaz_meeting', 'muqami_meeting', 'city_meeting'];
      return (
        <div className="space-y-4">
          {groups.map((groupKey) => {
            const groupFields = fields.filter((f) => f.group === groupKey);
            const heading = groupFields[0]?.groupTitle;
            return (
              <div
                key={groupKey}
                className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5"
              >
                {heading && (
                  <h3 className="text-sm font-bold text-emerald-950 sm:text-base">
                    {heading}
                  </h3>
                )}
                {groupFields.map((field) => (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={answers[String(field.id)]}
                    error={errors[String(field.id)]}
                    onChange={onChange}
                  />
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    if (section.id === 6) {
      return (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <FieldRenderer
              field={fields[0]}
              value={answers[String(fields[0].id)]}
              error={errors[String(fields[0].id)]}
              onChange={onChange}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.slice(1).map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={answers[String(field.id)]}
                error={errors[String(field.id)]}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      );
    }

    if (section.id === 8) {
      const descriptiveFields = fields.filter((f) => f.group !== 'next_month_goals');
      const goalFields = fields.filter((f) => f.group === 'next_month_goals');

      return (
        <div className="space-y-5">
          {descriptiveFields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={answers[String(field.id)]}
              error={errors[String(field.id)]}
              onChange={onChange}
            />
          ))}

          <div className="space-y-3 rounded-xl border border-emerald-900/15 bg-emerald-50/50 p-4 sm:p-5">
            <h3 className="text-sm font-bold text-emerald-950">
              4. अगले महीने के लिए आपके तीन प्रमुख लक्ष्य:
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {goalFields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={answers[String(field.id)]}
                  error={errors[String(field.id)]}
                  onChange={onChange}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (section.id === 9) {
      const gridFields = fields.filter((f) => f.group === 'review_grid');
      const planField = fields.find((f) => f.group === 'review_plan');
      const sigFields = fields.filter((f) => f.group === 'review_signatures');

      return (
        <div className="space-y-5">
          <div
            className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950"
            role="note"
          >
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div className="space-y-1 text-sm">
                <p className="font-bold">
                  अधिकृत GHF ज़िम्मेदार समीक्षा अनुभाग (Section 9)
                </p>
                <p className="leading-relaxed text-amber-900">
                  यह अनुभाग केवल अधिकृत GHF ज़िम्मेदार व्यक्ति (Responsible Person) द्वारा
                  समीक्षा और मार्गदर्शन दर्ज करने के लिए है। फेज़ 1 में कोई सार्वजनिक एडमिनिस्ट्रेटर
                  समीक्षा प्रणाली सक्रिय नहीं है, परंतु ये फ़ील्ड स्थानीय ड्राफ्ट संरचना में सुरक्षित
                  रखे जाते हैं।
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {gridFields.map((field) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 bg-white p-3.5"
              >
                <FieldRenderer
                  field={field}
                  value={answers[String(field.id)]}
                  error={errors[String(field.id)]}
                  onChange={onChange}
                />
              </div>
            ))}
          </div>

          {planField && (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <FieldRenderer
                field={planField}
                value={answers[String(planField.id)]}
                error={errors[String(planField.id)]}
                onChange={onChange}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            {sigFields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={answers[String(field.id)]}
                error={errors[String(field.id)]}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      );
    }

    // Default layout (e.g., Section 7)
    return (
      <div className="space-y-4">
        {fields.map((field) => (
          <div
            key={field.id}
            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
          >
            <FieldRenderer
              field={field}
              value={answers[String(field.id)]}
              error={errors[String(field.id)]}
              onChange={onChange}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <section
      aria-labelledby={`section-heading-${section.id}`}
      className={`rounded-2xl border bg-white p-4 shadow-xs sm:p-6 ${
        section.isResponsibleOnly
          ? 'border-2 border-amber-400/80 bg-amber-50/15'
          : 'border-emerald-900/10'
      }`}
    >
      <div
        className={`mb-5 flex flex-col gap-1 border-b pb-4 sm:flex-row sm:items-center sm:justify-between ${
          section.isResponsibleOnly ? 'border-amber-200' : 'border-emerald-900/10'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            {section.isResponsibleOnly && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                <Lock className="h-3 w-3" />
                अधिकृत ज़िम्मेदार हेतु
              </span>
            )}
          </div>
          <h2
            id={`section-heading-${section.id}`}
            className="mt-1 text-lg font-bold text-emerald-950 sm:text-xl"
          >
            {section.title}
          </h2>
          {section.description && (
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              {section.description}
            </p>
          )}
        </div>
      </div>

      {renderSectionBody()}
    </section>
  );
}
