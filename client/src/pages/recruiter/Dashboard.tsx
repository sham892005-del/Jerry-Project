import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  BookOpen,
  Calendar,
  Users,
  Kanban,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get<any>('/recruiter/dashboard');
        setData(res);
      } catch (err) {
        console.error('Failed to load recruiter dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const pipeline = data?.pipeline || {};
  const recentApplicants = data?.recentApplicants || [];

  const pipelineChartData = [
    { name: 'Applied', count: pipeline.applied || 0 },
    { name: 'Review', count: pipeline.under_review || 0 },
    { name: 'Shortlisted', count: pipeline.shortlisted || 0 },
    { name: 'Interview', count: pipeline.interview || 0 },
    { name: 'Selected', count: pipeline.selected || 0 },
    { name: 'Rejected', count: pipeline.rejected || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-950 px-2.5 py-1 rounded-full border border-violet-800/50">
            Hiring Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
            {user?.organizationName || 'TechNova Solutions'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Manage your opportunities, evaluate engineering applicants, and advance candidates across hiring stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recruiter/jobs"
            className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition"
          >
            Post New Job
          </Link>
          <Link
            to="/recruiter/pipeline"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            Open Pipeline
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
            <Briefcase className="w-4 h-4 text-violet-600" /> Active Jobs
          </span>
          <p className="text-2xl font-black text-slate-900">{metrics.totalJobs || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Internships
          </span>
          <p className="text-2xl font-black text-slate-900">{metrics.totalInternships || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
            <Calendar className="w-4 h-4 text-emerald-600" /> Campus Drives
          </span>
          <p className="text-2xl font-black text-slate-900">{metrics.totalDrives || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
            <Users className="w-4 h-4 text-blue-600" /> Total Applicants
          </span>
          <p className="text-2xl font-black text-slate-900">{metrics.totalApplicants || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2">
            <UserCheck className="w-4 h-4 text-emerald-600" /> Selected Offers
          </span>
          <p className="text-2xl font-black text-emerald-600">{pipeline.selected || 0}</p>
        </div>
      </div>

      {/* Grid: Pipeline Chart & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Funnel Distribution</h3>
              <p className="text-xs text-slate-400">Live candidate pipeline across active opportunities</p>
            </div>
            <Link to="/recruiter/pipeline" className="text-xs font-semibold text-violet-600 hover:underline">
              View Kanban →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Candidates</h3>
              <Link to="/recruiter/applications" className="text-xs font-semibold text-violet-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentApplicants.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No candidate applications received yet.</p>
              ) : (
                recentApplicants.map((app: any) => (
                  <div key={app.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{app.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {app.degree} in {app.branch} • {app.show_cgpa ? `CGPA ${app.cgpa}` : '[CGPA Hidden]'}
                      </p>
                    </div>

                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shrink-0">
                      {app.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              to="/recruiter/students"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Users className="w-3.5 h-3.5" /> Find & Shortlist Students
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
