import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, ArrowRight, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const RecruiterPending: React.FC = () => {
  const { user } = useAuth();
  const isRejected = user?.companyStatus === 'rejected';

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto ${
          isRejected ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {isRejected ? <ShieldAlert className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
        </div>

        <div>
          <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
            isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }`}>
            Status: {user?.companyStatus?.toUpperCase() || 'PENDING APPROVAL'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
            {isRejected
              ? 'Organization Verification Rejected'
              : 'Organization Verification in Progress'}
          </h2>
          <p className="text-xs text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            {isRejected
              ? 'Your organization registration was reviewed and rejected by the platform administrator.'
              : 'Your corporate credentials have been submitted for institutional administrator review. Once verified, you will be authorized to publish opportunities and host campus drives.'}
          </p>
        </div>

        {/* Info Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2 max-w-md mx-auto">
          <p className="font-semibold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>{user?.organizationName || 'Registered Entity'}</span>
          </p>
          <p className="text-slate-500 text-[11px]">Official Email: {user?.email}</p>
          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
            <span>Tip for demonstration: Log in with the Administrator account (</span>
            <strong className="text-slate-800">admin@demo.com</strong>
            <span>) to immediately approve pending organizations.</span>
          </div>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/recruiter/profile"
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
          >
            Review Profile
          </Link>
          <Link
            to="/recruiter/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Go to Dashboard Overview
          </Link>
        </div>
      </div>
    </div>
  );
};
