import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  Loader2,
  Mail,
  RefreshCw,
  Server,
  Sheet,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { fetchAdminSystemHealthRequest } from '../../services/adminApi.js';

export default function AdminSystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminSystemHealthRequest();
      setHealth(res);
    } catch (err) {
      setError(err?.message || 'सिस्टम हेल्थ लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  const backend = health?.backend || {};
  const database = health?.database || {};
  const email = health?.integrations?.email || {};
  const sheets = health?.integrations?.googleSheets || {};
  const jobs = health?.jobs || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            सिस्टम हेल्थ और मॉनिटरिंग (System Health)
          </h2>
          <p className="text-sm text-slate-600">
            सर्वर, डेटाबेस, इंटीग्रेशन और बैकग्राउंड जॉब कतार की वास्तविक स्थिति।
          </p>
        </div>

        <button
          type="button"
          onClick={loadHealth}
          disabled={loading}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>रिफ्रेश करें</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !health ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-900/10 bg-white py-12 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <span>सिस्टम स्थिति जांची जा रही है...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Backend Server</span>
                <Server className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-lg font-bold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span className="uppercase">{backend.status || 'online'}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                अपटाइम: {backend.uptimeSeconds ?? 0}s
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">MongoDB Atlas</span>
                <Database className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900 capitalize">
                {database.status || 'unknown'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                कुल रिकॉर्ड: {database.totalSubmissions ?? 0}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Email Service</span>
                <Mail className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {email.configured ? 'Configured' : 'Not Configured'}
              </p>
              <p className="mt-1 text-xs text-slate-500 uppercase">
                Provider: {email.provider || 'none'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Google Sheets</span>
                <Sheet className="h-4 w-4 text-emerald-700" />
              </div>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {sheets.connected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Service Account Sync
              </p>
            </div>
          </div>

          <section className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                बैकग्राउंड जॉब कतार (Background Sync Jobs)
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-amber-50 p-3.5">
                <p className="text-xs font-semibold text-amber-900">लंबित जॉब्स (Pending)</p>
                <p className="mt-1 text-2xl font-bold text-amber-950">{jobs.pending ?? 0}</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3.5">
                <p className="text-xs font-semibold text-red-900">असफल जॉब्स (Failed)</p>
                <p className="mt-1 text-2xl font-bold text-red-950">{jobs.failed ?? 0}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3.5">
                <p className="text-xs font-semibold text-emerald-900">पूर्ण जॉब्स (Completed)</p>
                <p className="mt-1 text-2xl font-bold text-emerald-950">{jobs.completed ?? 0}</p>
              </div>
            </div>

            {jobs.recentFailures?.length > 0 && (
              <div className="mt-5">
                <h4 className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">
                  हालिया असफल प्रयास (Recent Job Failures)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="px-3 py-2">SID</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Attempts</th>
                        <th className="px-3 py-2">Error Code</th>
                        <th className="px-3 py-2">Last Attempt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.recentFailures.map((f) => (
                        <tr key={`${f.sid}-${f.type}`} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-mono font-semibold">{f.sid}</td>
                          <td className="px-3 py-2">{f.type}</td>
                          <td className="px-3 py-2">{f.attempts}</td>
                          <td className="px-3 py-2 text-red-700">{f.lastErrorCode || 'ERR'}</td>
                          <td className="px-3 py-2 text-slate-500">
                            {f.lastAttemptAt ? new Date(f.lastAttemptAt).toLocaleString('hi-IN') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
