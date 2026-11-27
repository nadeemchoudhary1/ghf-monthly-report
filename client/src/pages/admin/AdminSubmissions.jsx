import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Loader2,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReviewStatusBadge from '../../components/admin/ReviewStatusBadge.jsx';
import {
  EmailStatusBadge,
  SheetStatusBadge,
} from '../../components/admin/SyncStatusBadges.jsx';
import { formatFieldAnswer } from '../../schemas/answerMappings.js';
import { FIELDS } from '../../schemas/formSchema.js';
import {
  downloadExportFile,
  fetchAdminSubmissionsRequest,
} from '../../services/adminApi.js';

export default function AdminSubmissions() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [month, setMonth] = useState('');
  const [city, setCity] = useState('');
  const [rs, setRs] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminSubmissionsRequest({
        page,
        limit,
        q: debouncedQuery,
        month,
        city,
        rs,
        sort,
      });
      setData(res);
    } catch (err) {
      setError(err?.message || 'सबमिशन सूची लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedQuery, month, city, rs, sort]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const filterOptions = data?.filterOptions || { months: [], cities: [] };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedQuery('');
    setMonth('');
    setCity('');
    setRs('');
    setFromDate('');
    setToDate('');
    setSort('newest');
    setPage(1);
  };

  const handleExport = async (format) => {
    setExporting(format);
    setError('');
    try {
      await downloadExportFile({
        format,
        month,
        city,
        rs,
        from: fromDate,
        to: toDate,
      });
    } catch (err) {
      setError(err?.message || 'एक्सपोर्ट असफल रहा।');
    } finally {
      setExporting('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            सभी मासिक जायज़ा रिकॉर्ड
          </h2>
          <p className="text-sm text-slate-600">
            खोजें, फ़िल्टर करें, सिंक स्थिति देखें और CSV / Excel एक्सपोर्ट करें।
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={Boolean(exporting)}
            onClick={() => handleExport('csv')}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-emerald-700 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-50 disabled:opacity-60"
          >
            {exporting === 'csv' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>CSV एक्सपोर्ट</span>
          </button>
          <button
            type="button"
            disabled={Boolean(exporting)}
            onClick={() => handleExport('xlsx')}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-emerald-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {exporting === 'xlsx' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5" />
            )}
            <span>Excel (.xlsx) एक्सपोर्ट</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Card */}
      <section className="space-y-3 rounded-2xl border border-emerald-900/10 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="नाम, मोबाइल, ईमेल या SID से खोजें..."
              className="min-h-[44px] w-full rounded-xl border border-slate-300 pr-3 pl-10 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            aria-label="महीना फ़िल्टर"
            className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-emerald-700 focus:outline-none"
          >
            <option value="">सभी महीने</option>
            {filterOptions.months.map((m) => (
              <option key={m} value={m}>
                {formatFieldAnswer(FIELDS['2'], m)} ({m})
              </option>
            ))}
          </select>

          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            aria-label="शहर फ़िल्टर"
            className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-emerald-700 focus:outline-none"
          >
            <option value="">सभी शहर / इलाके</option>
            {filterOptions.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={rs}
            onChange={(e) => {
              setRs(e.target.value);
              setPage(1);
            }}
            aria-label="समीक्षा स्थिति फ़िल्टर"
            className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 text-sm focus:border-emerald-700 focus:outline-none"
          >
            <option value="">सभी समीक्षा स्थिति</option>
            <option value="0">लंबित समीक्षा (Pending)</option>
            <option value="1">समीक्षित (Reviewed)</option>
            <option value="2">स्वीकृत (Approved)</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-semibold text-slate-600">क्रम:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                aria-label="क्रम चुनें"
                className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium"
              >
                <option value="newest">नवीनतम पहले</option>
                <option value="oldest">पुराने पहले</option>
                <option value="name_asc">नाम (A-Z / क-ज्ञ)</option>
                <option value="month_desc">महीना (नया से पुराना)</option>
                <option value="month_asc">महीना (पुराना से नया)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span>एक्सपोर्ट अवधि:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label="Export From Date"
                className="min-h-[34px] rounded-lg border border-slate-300 px-2 text-xs"
              />
              <span>–</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label="Export To Date"
                className="min-h-[34px] rounded-lg border border-slate-300 px-2 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-slate-600">
              <span>प्रति पृष्ठ:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="min-h-[36px] rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </label>

            <button
              type="button"
              onClick={handleResetFilters}
              className="min-h-[36px] rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 hover:bg-slate-50"
            >
              फ़िल्टर रीसेट
            </button>
          </div>
        </div>
      </section>

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
            onClick={loadSubmissions}
            className="rounded-lg border border-red-300 bg-white px-3 py-1 text-xs font-semibold text-red-800"
          >
            पुनः प्रयास
          </button>
        </div>
      )}

      {/* Results Table */}
      <section className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-white shadow-xs">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
            <span>रिकॉर्ड लोड हो रहे हैं...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">
            चयनित खोज या फ़िल्टर से कोई रिकॉर्ड नहीं मिला।
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-emerald-50/60 text-xs font-bold text-emerald-950 uppercase">
                    <th className="px-3 py-3">सबमिशन आईडी</th>
                    <th className="px-3 py-3">साथी का नाम</th>
                    <th className="px-3 py-3">मोबाइल / ईमेल</th>
                    <th className="px-3 py-3">शहर</th>
                    <th className="px-3 py-3">महीना</th>
                    <th className="px-3 py-3">समीक्षा</th>
                    <th className="px-3 py-3">ईमेल / Sheets</th>
                    <th className="px-3 py-3 text-right">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.sid}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/30"
                    >
                      <td className="px-3 py-3 font-mono text-xs font-semibold text-emerald-900">
                        {item.sid}
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-900">
                        {item.memberName || '—'}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-700">
                        <div>{item.mobile || '—'}</div>
                        {item.email && (
                          <div className="text-slate-500">{item.email}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {item.city || '—'}
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-700">
                        <div>{formatFieldAnswer(FIELDS['2'], item.month) || item.month}</div>
                        <div className="text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <ReviewStatusBadge status={item.rs} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          <EmailStatusBadge status={item.emailStatus} />
                          <SheetStatusBadge status={item.sheetStatus} />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to={`/admin/submissions/${encodeURIComponent(item.sid)}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>विवरण</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {items.map((item) => (
                <div key={item.sid} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-[11px] font-semibold text-emerald-800">
                        {item.sid}
                      </p>
                      <p className="font-bold text-slate-900">
                        {item.memberName || 'नाम दर्ज नहीं'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.mobile || '—'} • {item.city || '—'}
                      </p>
                    </div>
                    <ReviewStatusBadge status={item.rs} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <EmailStatusBadge status={item.emailStatus} />
                    <SheetStatusBadge status={item.sheetStatus} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {formatFieldAnswer(FIELDS['2'], item.month)} •{' '}
                      {new Date(item.createdAt).toLocaleDateString('hi-IN')}
                    </span>
                    <Link
                      to={`/admin/submissions/${encodeURIComponent(item.sid)}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-800 px-3 py-1.5 font-semibold text-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>विवरण</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-5 py-3 text-xs">
              <span className="text-slate-600">
                कुल {pagination.total} रिकॉर्ड • पृष्ठ {pagination.page} / {pagination.totalPages}
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
