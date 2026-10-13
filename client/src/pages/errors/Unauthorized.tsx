import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { user, logout } = useAuth();

  const getPortalHome = () => {
    if (!user) return '/';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'recruiter') {
      return user.companyStatus === 'pending' ? '/recruiter/pending' : '/recruiter/dashboard';
    }
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
        <div className="h-20 w-20 bg-rose-50 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
          <ShieldAlert className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
            HTTP 403 Forbidden
          </span>
          <h1 className="text-2xl font-bold text-slate-900 pt-2">Access Denied</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Your current account role ({user ? <strong className="capitalize font-semibold text-slate-800">{user.role}</strong> : 'Unauthenticated'}) does not have permission to view this restricted portal.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <Link
            to={getPortalHome()}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition text-sm shadow-md shadow-indigo-100"
          >
            <Home className="h-4 w-4" />
            Go to My Authorized Dashboard
          </Link>

          {user && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition text-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out & Switch Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
