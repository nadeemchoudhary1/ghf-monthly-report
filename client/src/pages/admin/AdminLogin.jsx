import { AlertCircle, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

export default function AdminLogin() {
  const { isAuthenticated, checking, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/admin';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!checking && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('कृपया ईमेल/यूज़रनेम और पासवर्ड दोनों दर्ज करें।');
      return;
    }

    setSubmitting(true);
    try {
      await login({ identifier: identifier.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'लॉगिन असफल रहा। कृपया विवरण जांचें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-emerald-50/40 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-emerald-900/15 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-sm font-bold tracking-wider">
              GHF
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-widest text-emerald-200 uppercase">
                GUIDED HUMANITY FOUNDATION
              </p>
              <h1 className="text-lg font-bold">एडमिन लॉगिन पोर्टल</h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5 text-xs text-emerald-900">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>यह क्षेत्र केवल अधिकृत GHF ज़िम्मेदार एवं एडमिनिस्ट्रेटर के लिए है।</span>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800 sm:text-sm"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="admin-identifier"
              className="block text-sm font-semibold text-slate-800"
            >
              ईमेल या यूज़रनेम
            </label>
            <input
              id="admin-identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@ghf.org या username"
              className="min-h-[46px] w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-sm font-semibold text-slate-800"
            >
              पासवर्ड
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="min-h-[46px] w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white shadow-xs transition-colors hover:bg-emerald-900 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>लॉगिन हो रहा है...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>लॉगिन करें</span>
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              to="/"
              className="text-xs font-semibold text-emerald-800 hover:underline"
            >
              ← पब्लिक जायज़ा फ़ॉर्म पर वापस जाएँ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
