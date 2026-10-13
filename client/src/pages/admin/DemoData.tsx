import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building2,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export const AdminDemoData: React.FC = () => {
  const { showToast } = useNotifications();
  const [seeding, setSeeding] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSeed = async () => {
    if (
      !window.confirm(
        '⚠️ Warning: This will reset the database tables and re-populate with clean demo entities. Do you wish to proceed?'
      )
    ) {
      return;
    }

    setSeeding(true);
    try {
      const res = await api.post<any>('/admin/demo-data/seed');
      showToast(res.message || 'Database re-seeded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to seed database.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied "${text}" to clipboard`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="h-7 w-7 text-indigo-600" />
          Demo Data & Database Management
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Reset and re-populate the relational database with realistic demo accounts, careers, job listings, and student roadmaps.
        </p>
      </div>

      {/* Seeding Action Card */}
      <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full">
            <RefreshCw className="h-3.5 w-3.5" />
            Zero-Config Local State Persistence
          </div>
          <h2 className="text-xl font-bold">1-Click Database Reset & Re-Seed</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Re-initializes all normalized tables (users, careers, student skills, companies, jobs, recruitment drives, applications, and chat sessions) with verified initial states.
          </p>
        </div>

        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`h-5 w-5 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Re-seeding Database...' : 'Re-Seed Clean Demo Data'}
        </button>
      </div>

      {/* Demo Credentials Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-600" />
            Evaluation Credentials Reference
          </h3>
          <p className="text-slate-500 text-xs mt-0.5">
            Use these pre-configured demo logins to test each role's distinct portal experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Student */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded-md">
                Student Account
              </span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Email:</div>
              <div className="flex items-center justify-between font-mono text-sm font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 mt-1">
                <span>student@demo.com</span>
                <button
                  onClick={() => copyToClipboard('student@demo.com', 'student-email')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedKey === 'student-email' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Password:</div>
              <div className="flex items-center justify-between font-mono text-sm font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 mt-1">
                <span>Student@123</span>
                <button
                  onClick={() => copyToClipboard('Student@123', 'student-pwd')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedKey === 'student-pwd' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Recruiter */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-md">
                Recruiter Account
              </span>
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Email:</div>
              <div className="flex items-center justify-between font-mono text-sm font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 mt-1">
                <span>recruiter@demo.com</span>
                <button
                  onClick={() => copyToClipboard('recruiter@demo.com', 'rec-email')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedKey === 'rec-email' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Password:</div>
              <div className="flex items-center justify-between font-mono text-sm font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 mt-1">
                <span>Recruiter@123</span>
                <button
                  onClick={() => copyToClipboard('Recruiter@123', 'rec-pwd')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedKey === 'rec-pwd' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Admin */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2.5 py-0.5 rounded-md">
                Administrator Account
              </span>
              <Lock className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Email:</div>
              <div className="flex items-center justify-between font-mono text-sm font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 mt-1">
                <span>admin@demo.com</span>
                <button
                  onClick={() => copyToClipboard('admin@demo.com', 'admin-email')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedKey === 'admin-email' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Password:</div>
              <div className="flex items-center justify-between font-mono text-sm font-semibold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 mt-1">
                <span>Admin@123</span>
                <button
                  onClick={() => copyToClipboard('Admin@123', 'admin-pwd')}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copiedKey === 'admin-pwd' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
