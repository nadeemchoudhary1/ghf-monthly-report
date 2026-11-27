import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

export default function AdminProtectedRoute() {
  const { isAuthenticated, checking, justLoggedOut } = useAdminAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-50/40 p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-6 py-4 text-sm font-semibold text-emerald-900 shadow-xs">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" />
          <span>एडमिन सत्र की जांच हो रही है...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        state={justLoggedOut ? undefined : { from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
}
