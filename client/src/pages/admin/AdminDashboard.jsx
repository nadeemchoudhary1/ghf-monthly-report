import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileCheck2,
  Files,
  Loader2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReviewStatusBadge from '../../components/admin/ReviewStatusBadge.jsx';
import { formatFieldAnswer } from '../../schemas/answerMappings.js';
import { FIELDS } from '../../schemas/formSchema.js';
import { fetchAdminDashboardRequest } from '../../services/adminApi.js';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (targetPage) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminDashboardRequest({ page: targetPage, limit: 10 });
      setData(res);
    } catch (err) {
      setError(err?.message || 'डैशबोर्ड डेटा लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(page);
  }, [page, loadDashboard]);

  const stats = data?.stats || {
    totalSubmissions: 0,
    currentMonthSubmissions: 0,
    pendingReview: 0,
    reviewed: 0,
    approved: 0,
  };

  const statCards = [
    {
      label: 'कुल सबमिशन (Total)',
      value: stats.totalSubmissions,
      icon: Files,
      tone: 'border-emerald-200 bg-white text-emerald-900',
    },
    {
      label: `वर्तमान माह (${stats.currentMonth || 'Current'})`,
      value: stats.currentMonthSubmissions,
      icon: CalendarCheck,
      tone: 'border-teal-200 bg-white text-teal-900',
    },
    {
      label: 'लंबित समीक्षा (Pending)',
      value: stats.pendingReview,
      icon: Clock,
      tone: 'border-amber-200 bg-amber-50/40 text-amber-900',
    },
    {
      label: 'समीक्षित (Reviewed)',
      value: stats.reviewed,
      icon: FileCheck2,
      tone: 'border-blue-200 bg-blue-50/40 text-blue-900',
    },
    {
      label: 'स्वीकृत (Approved)',
      value: stats.approved,
      icon: CheckCircle2,
      tone: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
    },
  ];

  const recent = data?.recentSubmissions || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            एडमिन डैशबोर्ड
          </h2>
          <p className="text-sm text-slate-600">
            मासिक जायज़ा रिपोर्टों का वास्तविक समय सारांश
          </p>
        </div>

        <Link
          to="/admin/submissions"
          className="inline-flex min-h-[42px] items-center rounded-xl bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
        >
          सभी जायज़े देखें →
        </Link>
      </div>

      {error && (
        <div
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard(page)}
            className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-800 hover:bg-red-50"
          >
            पुनः प्रयास
          </button>
        </div>
      )}

      {/* 5 Real MongoDB Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className={`rounded-2xl border p-4 shadow-2xs ${tone}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold opacity-80">{label}</p>
              <Icon className="h-4 w-4 opacity-75" />
            </div>
            <p className="mt-2 text-2xl font-bold">{loading && !data ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Recent Submissions Table */}
      <section className="rounded-2xl border border-emerald-900/10 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            हालिया सबमिशन (Recent Submissions)
          </h3>
          <span className="text-xs font-medium text-slate-500">
            कुल रिकॉर्ड: {pagination.total}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
            <span>डेटा लोड हो रहा है...</span>
          </div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            अभी तक कोई जायज़ा सबमिट नहीं हुआ है।
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-emerald-50/60 text-xs font-bold text-emerald-950 uppercase">
                    <th className="px-4 py-3">साथी का नाम</th>
                    <th className="px-4 py-3">मोबाइल नंबर</th>
                    <th className="px-4 py-3">शहर / इलाका</th>
                    <th className="px-4 py-3">महीना</th>
                    <th className="px-4 py-3">तारीख</th>
                    <th className="px-4 py-3">समीक्षा स्थिति</th>
                    <th className="px-4 py-3 text-right">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                    <tr
                      key={item.sid}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/30"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {item.memberName || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.mobile || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {item.city || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatFieldAnswer(FIELDS['2'], item.month) || item.month}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <ReviewStatusBadge status={item.rs} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/submissions/${encodeURIComponent(item.sid)}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>विवरण देखें</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {recent.map((item) => (
                <div key={item.sid} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">
                        {item.memberName || 'नाम दर्ज नहीं'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.mobile || '—'} • {item.city || '—'}
                      </p>
                    </div>
                    <ReviewStatusBadge status={item.rs} />
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
                    <span>
                      {formatFieldAnswer(FIELDS['2'], item.month)} •{' '}
                      {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                    </span>
                    <Link
                      to={`/admin/submissions/${encodeURIComponent(item.sid)}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-800 px-3 py-1.5 font-semibold text-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>देखें</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs">
              <span className="text-slate-600">
                पृष्ठ {pagination.page} / {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>पिछला</span>
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <span>अगला</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
