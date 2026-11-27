import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { adminChangePasswordRequest } from '../../services/adminApi.js';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('कृपया सभी पासवर्ड फ़ील्ड भरें।');
      return;
    }

    if (newPassword.length < 8) {
      setError('नया पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खा रहे हैं।');
      return;
    }

    setSaving(true);
    try {
      await adminChangePasswordRequest({ currentPassword, newPassword });
      setSuccess('पासवर्ड सफलतापूर्वक बदल दिया गया है।');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err?.message || 'पासवर्ड बदलने में त्रुटि हुई।');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          एडमिन पासवर्ड बदलें
        </h2>
        <p className="text-sm text-slate-600">
          सुरक्षा के लिए नया पासवर्ड सेट करने से पहले वर्तमान पासवर्ड की पुष्टि आवश्यक है।
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs sm:p-6"
      >
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800 sm:text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 sm:text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="cur-pass" className="block text-sm font-semibold text-slate-800">
            वर्तमान पासवर्ड
          </label>
          <input
            id="cur-pass"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="min-h-[46px] w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-pass" className="block text-sm font-semibold text-slate-800">
            नया पासवर्ड (न्यूनतम 8 अक्षर)
          </label>
          <input
            id="new-pass"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="min-h-[46px] w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-pass" className="block text-sm font-semibold text-slate-800">
            नए पासवर्ड की पुष्टि करें
          </label>
          <input
            id="confirm-pass"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="min-h-[46px] w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-900 disabled:opacity-70"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>अपडेट हो रहा है...</span>
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              <span>पासवर्ड अपडेट करें</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
