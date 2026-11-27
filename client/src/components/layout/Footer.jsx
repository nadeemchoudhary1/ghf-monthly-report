import { FORM_META } from '../../schemas/formSchema.js';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-emerald-900/10 bg-white py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-slate-600 sm:flex-row sm:px-6 sm:text-left">
        <p className="font-semibold tracking-wide text-emerald-900">
          {FORM_META.motto}
        </p>
        <p>
          {FORM_META.organization} • मासिक तरबियती पोर्टल
        </p>
      </div>
    </footer>
  );
}
