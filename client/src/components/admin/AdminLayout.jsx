import {
  Activity,
  ClipboardList,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    navigate('/admin/login', { replace: true, state: null });
    await logout();
  };

  const navItems = [
    { to: '/admin', end: true, label: 'डैशबोर्ड (Dashboard)', icon: LayoutDashboard },
    { to: '/admin/submissions', end: false, label: 'सभी जायज़े (Submissions)', icon: ClipboardList },
    { to: '/admin/integrations', end: true, label: 'सेटिंग्स → इंटीग्रेशन', icon: Settings },
    { to: '/admin/system-health', end: true, label: 'सिस्टम हेल्थ', icon: Activity },
    { to: '/admin/change-password', end: true, label: 'पासवर्ड बदलें', icon: KeyRound },
  ];

  const linkClass = ({ isActive }) =>
    `flex min-h-[44px] items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-emerald-800 text-white shadow-xs'
        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
    }`;

  return (
    <div className="min-h-screen bg-emerald-50/40">
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-600" />

      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-emerald-900/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="मेनू खोलें"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-xs font-bold tracking-wider text-white">
                GHF
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase">
                  GHF Admin Panel
                </p>
                <h1 className="text-sm font-bold text-slate-900 sm:text-base">
                  कारकर्दगी जायज़ा प्रबंधन प्रणाली
                </h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-slate-900">{admin?.name || admin?.username}</p>
              <p className="text-[11px] text-slate-500">{admin?.email}</p>
            </div>

            <Link
              to="/"
              className="hidden min-h-[38px] items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>पब्लिक फ़ॉर्म</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav className="space-y-1 border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
            {navItems.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={linkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
            <Link
              to="/"
              className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              <ExternalLink className="h-4 w-4" />
              <span>पब्लिक फ़ॉर्म खोलें</span>
            </Link>
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-1.5 rounded-2xl border border-emerald-900/10 bg-white p-3 shadow-xs">
            {navItems.map(({ to, end, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
