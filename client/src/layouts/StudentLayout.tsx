import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  BarChart2,
  Compass,
  BookOpen,
  Briefcase,
  Clock,
  Calendar,
  FileText,
  Bookmark,
  Building2,
  Bot,
  UserCheck,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from '../components/NotificationBell';
import { ToastContainer } from '../components/ui/ToastContainer';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/auth/student/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'AI Recommendations', path: '/student/recommendations', icon: Sparkles, badge: 'AI' },
    { label: 'Skill-Gap Analysis', path: '/student/skill-gap', icon: BarChart2 },
    { label: 'Learning Roadmap', path: '/student/roadmap', icon: Compass },
    { label: 'Courses', path: '/student/courses', icon: BookOpen },
    { label: 'Jobs Marketplace', path: '/student/jobs', icon: Briefcase },
    { label: 'Internships', path: '/student/internships', icon: Clock },
    { label: 'Campus Drives', path: '/student/drives', icon: Calendar },
    { label: 'My Applications', path: '/student/applications', icon: FileText },
    { label: 'Saved Items', path: '/student/saved', icon: Bookmark },
    { label: 'Organizations', path: '/student/organizations', icon: Building2 },
    { label: 'AI Career Advisor', path: '/student/advisor', icon: Bot, badge: 'Chat' },
    { label: 'Profile & Privacy', path: '/student/profile', icon: UserCheck },
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

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-5">
          <Link to="/student/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight">CareerAI</span>
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                Student
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
                      ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Card */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.fullName || 'Student Account'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800 hidden sm:block">
              Student Career Workspace
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/advisor"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-100 hover:border-indigo-200 transition"
            >
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask AI Advisor</span>
            </Link>

            <NotificationBell />

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            <Link to="/student/profile" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-xs font-bold group-hover:border-indigo-400 transition">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
              <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-600 hidden md:block">
                {user?.fullName?.split(' ')[0] || 'Profile'}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
