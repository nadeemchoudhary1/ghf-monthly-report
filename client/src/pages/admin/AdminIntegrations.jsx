import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCw,
  Sheet,
  WifiOff,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  fetchIntegrationsStatusRequest,
  retryAllFailedEmailsRequest,
  retryAllFailedSheetsRequest,
  testEmailIntegrationRequest,
  testSheetsIntegrationRequest,
} from '../../services/adminApi.js';

export default function AdminIntegrations() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionBanner, setActionBanner] = useState(null);
  const [busyAction, setBusyAction] = useState('');
  const [sendTestMessage, setSendTestMessage] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchIntegrationsStatusRequest();
      setStatus(res);
    } catch (err) {
      setError(err?.message || 'इंटीग्रेशन स्थिति लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const runAction = async (key, fn, successFallback) => {
    setBusyAction(key);
    setActionBanner(null);
    try {
      const res = await fn();
      setActionBanner({
        ok: true,
        message: res?.message || successFallback,
      });
      await loadStatus();
    } catch (err) {
      setActionBanner({
        ok: false,
        message: err?.message || 'ऑपरेशन असफल रहा।',
      });
    } finally {
      setBusyAction('');
    }
  };

  const email = status?.email || {};
  const sheets = status?.googleSheets || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            सेटिंग्स → इंटीग्रेशन (Integrations)
          </h2>
          <p className="text-sm text-slate-600">
            ईमेल सूचना और Google Sheets सिंक्रोनाइज़ेशन की स्थिति एवं मैनुअल नियंत्रण।
          </p>
        </div>

        <button
          type="button"
          onClick={loadStatus}
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

      {actionBanner && (
        <div
          className={`flex items-start gap-2.5 rounded-xl border p-4 text-sm ${
            actionBanner.ok
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
          role="status"
        >
          {actionBanner.ok ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          )}
          <span>{actionBanner.message}</span>
        </div>
      )}

      {loading && !status ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-900/10 bg-white py-12 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <span>इंटीग्रेशन स्थिति लोड हो रही है...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Email Integration Card */}
          <section className="flex flex-col justify-between space-y-5 rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      ईमेल इंटीग्रेशन (Email Integration)
                    </h3>
                    <p className="text-xs text-slate-500">
                      प्रदाता: <span className="font-semibold uppercase">{email.provider || 'unconfigured'}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    email.configured
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  {email.configured ? 'Configured' : 'Not Configured'}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">लंबित सूचनाएँ (Pending)</dt>
                  <dd className="mt-1 text-lg font-bold text-amber-800">
                    {email.pendingNotifications ?? 0}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">असफल सूचनाएँ (Failed)</dt>
                  <dd className="mt-1 text-lg font-bold text-red-700">
                    {email.failedNotifications ?? 0}
                  </dd>
                </div>
                <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">अंतिम सफल ईमेल</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {email.lastSuccessfulNotification
                      ? new Date(email.lastSuccessfulNotification).toLocaleString('hi-IN')
                      : 'अभी तक कोई सफल ईमेल नहीं'}
                  </dd>
                </div>
              </dl>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={sendTestMessage}
                  onChange={(e) => setSendTestMessage(e.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-700"
                />
                <span>जांच के दौरान एडमिन ईमेल पर एक टेस्ट संदेश भी भेजें</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={() =>
                  runAction(
                    'test-email',
                    () => testEmailIntegrationRequest({ sendTestMessage }),
                    'ईमेल कॉन्फ़िगरेशन सफल रहा।'
                  )
                }
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900 disabled:opacity-60"
              >
                {busyAction === 'test-email' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Test Email Configuration</span>
              </button>

              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={() =>
                  runAction(
                    'retry-email',
                    () => retryAllFailedEmailsRequest(),
                    'असफल ईमेल पुनः प्रयास कतार में भेजे गए।'
                  )
                }
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
              >
                {busyAction === 'retry-email' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Retry Failed Email</span>
              </button>
            </div>
          </section>

          {/* Google Sheets Integration Card */}
          <section className="flex flex-col justify-between space-y-5 rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                    <Sheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Google Sheets इंटीग्रेशन
                    </h3>
                    <p className="text-xs text-slate-500">
                      9 वर्कशीट टैब्स • Service Account Sync
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    sheets.connected
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  {!sheets.connected && <WifiOff className="h-3 w-3" />}
                  <span>{sheets.connected ? 'Connected' : 'Disconnected'}</span>
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">लंबित रिकॉर्ड (Pending)</dt>
                  <dd className="mt-1 text-lg font-bold text-amber-800">
                    {sheets.pendingRecords ?? 0}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">असफल रिकॉर्ड (Failed)</dt>
                  <dd className="mt-1 text-lg font-bold text-red-700">
                    {sheets.failedRecords ?? 0}
                  </dd>
                </div>
                <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                  <dt className="text-slate-500">अंतिम सफल सिंक्रोनाइज़ेशन</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {sheets.lastSuccessfulSync
                      ? new Date(sheets.lastSuccessfulSync).toLocaleString('hi-IN')
                      : 'अभी तक कोई सिंक रिकॉर्ड नहीं'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={() =>
                  runAction(
                    'test-sheets',
                    () => testSheetsIntegrationRequest(),
                    'Google Sheets कनेक्शन और 9 टैब सत्यापित हुए।'
                  )
                }
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-900 disabled:opacity-60"
              >
                {busyAction === 'test-sheets' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Test Google Sheets Connection</span>
              </button>

              <button
                type="button"
                disabled={Boolean(busyAction)}
                onClick={() =>
                  runAction(
                    'retry-sheets',
                    () => retryAllFailedSheetsRequest(),
                    'असफल Google Sheets सिंक पुनः प्रयास किए गए।'
                  )
                }
                className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
              >
                {busyAction === 'retry-sheets' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Retry Failed Sheets Sync</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
