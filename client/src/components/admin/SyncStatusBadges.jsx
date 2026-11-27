import { Mail, Sheet } from 'lucide-react';

const EMAIL_META = {
  pending: {
    label: 'Pending',
    classes: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  sent: {
    label: 'Sent',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  failed: {
    label: 'Failed',
    classes: 'border-red-200 bg-red-50 text-red-800',
  },
};

const SHEET_META = {
  pending: {
    label: 'Pending',
    classes: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  synced: {
    label: 'Synced',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  failed: {
    label: 'Failed',
    classes: 'border-red-200 bg-red-50 text-red-800',
  },
};

export function EmailStatusBadge({ status = 'pending' }) {
  const meta = EMAIL_META[status] || EMAIL_META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.classes}`}
    >
      <Mail className="h-3 w-3" />
      <span>{meta.label}</span>
    </span>
  );
}

export function SheetStatusBadge({ status = 'pending' }) {
  const meta = SHEET_META[status] || SHEET_META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.classes}`}
    >
      <Sheet className="h-3 w-3" />
      <span>{meta.label}</span>
    </span>
  );
}
