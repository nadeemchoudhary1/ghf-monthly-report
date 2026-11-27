import { ClipboardList, FileCheck2, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { FORM_META } from '../../schemas/formSchema.js';
import SaveStatusIndicator from '../navigation/SaveStatusIndicator.jsx';

export default function Header({
  saveStatus,
  saveError,
  lastSavedAt,
  hasDraftData,
  onRequestClearDraft,
}) {
  const { pathname } = useLocation();

  const navLinks = [
    { to: '/', label: 'होम', icon: Home },
    { to: '/form', label: 'जायज़ा फ़ॉर्म', icon: ClipboardList },
    { to: '/review', label: 'समीक्षा', icon: FileCheck2 },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-900/15 bg-white/95 backdrop-blur">
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-600" />
      <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold tracking-wider text-white shadow-sm">
              GHF
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase">
                {FORM_META.organization}
              </p>
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                {FORM_META.title}
              </h1>
            </div>
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-2 md:justify-end">
            <nav className="flex items-center gap-1 rounded-xl bg-emerald-50/90 p-1" aria-label="Main navigation">
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                      active
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-emerald-900 hover:bg-emerald-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>

            <SaveStatusIndicator
              status={saveStatus}
              error={saveError}
              lastSavedAt={lastSavedAt}
              hasDraftData={hasDraftData}
              onRequestClear={onRequestClearDraft}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
