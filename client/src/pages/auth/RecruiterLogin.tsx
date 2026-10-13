import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Lock, Mail, ArrowRight, Building2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const RecruiterLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('recruiter@demo.com');
    setPassword('Recruiter@123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post<any>('/auth/recruiter/login', { email, password });
      login(res.token, res.user);

      if (res.user.companyStatus === 'pending') {
        showToast('Registration pending administrator approval.', 'warning');
        navigate('/recruiter/pending');
      } else {
        showToast('Welcome to the Recruiter Portal!', 'success');
        navigate('/recruiter/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 mb-3 shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full block w-max mx-auto mb-1">
            Recruiter Portal
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Organization Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your opportunities, view student applicants, and track candidate pipelines.
          </p>
        </div>

        {/* Demo Credentials Helper */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-100/80 border border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-700">
            <span className="font-semibold text-slate-900">Demo Account:</span> recruiter@demo.com
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 text-xs font-semibold bg-white text-slate-700 border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50 transition"
          >
            Auto-fill
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Company Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@demo.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-800"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md shadow-slate-200 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Recruiter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New hiring partner?{' '}
              <Link to="/auth/recruiter/register" className="font-semibold text-violet-600 hover:underline">
                Register Organization
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
