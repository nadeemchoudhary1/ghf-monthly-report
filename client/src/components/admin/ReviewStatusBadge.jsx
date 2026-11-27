export const REVIEW_STATUS_META = {
  0: {
    label: 'लंबित समीक्षा (Pending)',
    shortLabel: 'Pending Review',
    classes: 'border-amber-200 bg-amber-50 text-amber-900',
  },
  1: {
    label: 'समीक्षित (Reviewed)',
    shortLabel: 'Reviewed',
    classes: 'border-blue-200 bg-blue-50 text-blue-900',
  },
  2: {
    label: 'स्वीकृत (Approved)',
    shortLabel: 'Approved',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
};

export default function ReviewStatusBadge({ status = 0 }) {
  const meta = REVIEW_STATUS_META[status] || REVIEW_STATUS_META[0];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}
