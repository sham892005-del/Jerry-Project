import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  FileCheck,
  Briefcase,
  Clock,
  BookOpen,
  Calendar,
  Users,
  BarChart3,
  Building2,
  LogOut,
  Menu,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ToastContainer } from '../components/ui/ToastContainer';

export const RecruiterLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPending = user?.companyStatus === 'pending';

  const handleSignOut = () => {
    logout();
    navigate('/auth/recruiter/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { label: 'Recruitment Pipeline', path: '/recruiter/pipeline', icon: Kanban, badge: 'Stages' },
    { label: 'Applications', path: '/recruiter/applications', icon: FileCheck },
    { label: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { label: 'Manage Internships', path: '/recruiter/internships', icon: Clock },
    { label: 'Manage Courses', path: '/recruiter/courses', icon: BookOpen },
    { label: 'Campus Drives', path: '/recruiter/drives', icon: Calendar },
    { label: 'Find Students', path: '/recruiter/students', icon: Users, badge: 'Search' },
    { label: 'Recruiter Analytics', path: '/recruiter/analytics', icon: BarChart3 },
    { label: 'Organization Profile', path: '/recruiter/profile', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Recruiter Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-5 bg-slate-950/50">
          <Link to="/recruiter/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">CareerAI</span>
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-950/80 border border-violet-800/50 px-1.5 py-0.5 rounded">
                Recruiter
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Banner */}
        <div className="p-3">
          {isPending ? (
            <Link
              to="/recruiter/pending"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs hover:bg-amber-500/15 transition"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold leading-none">Approval Pending</p>
                <p className="text-[10px] text-amber-400/80 mt-0.5">Admin review in progress</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-[11px]">Verified Organization</span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Recruiter User Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user?.organizationName?.charAt(0) || 'R'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.organizationName || 'Recruiter Portal'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800 hidden sm:block">
              {user?.organizationName || 'Talent Acquisition Portal'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/recruiter/profile"
              className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-violet-600 transition"
            >
              <Building2 className="w-4 h-4 text-violet-600" />
              <span>Company Profile</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Recruiter Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
