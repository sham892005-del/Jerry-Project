import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Compass,
  Briefcase,
  BookOpen,
  Calendar,
  ArrowRight,
  Bot,
  User,
  Clock,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get<any>('/student/dashboard');
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const student = data?.student || user;
  const topCareer = data?.topCareer;
  const statusSummary = data?.statusSummary || {};
  const completion = student?.completion_percentage || 50;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Guidance Active • {data?.aiProvider === 'gemini' ? 'Gemini 1.5 LLM' : 'Deterministic Engine'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
              {student?.degree} in {student?.branch} • {student?.college || 'National Institute of Technology'} • CGPA: <span className="font-bold text-white">{student?.cgpa || '8.65'}</span>
            </p>
          </div>

          {/* Profile Completion Widget */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 sm:min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
              <span>Profile Completion</span>
              <span>{completion}%</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
            <div className="mt-3 flex justify-end">
              <Link
                to="/student/profile"
                className="text-[11px] font-semibold text-white hover:underline flex items-center gap-1"
              >
                Complete Profile <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Top Career Recommendation Highlight Card */}
      {topCareer && (
        <div className="rounded-3xl bg-white border border-indigo-100 p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Top Recommended Career</span>
                <h3 className="text-lg font-bold text-slate-900">{topCareer.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-center">
                <span className="text-xl font-extrabold leading-none block">{topCareer.matchPercentage}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">Suitability</span>
              </div>
              <Link
                to="/student/recommendations"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <span>View Top 5 Careers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 italic">
            "{topCareer.reasoning}"
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Verified Matched Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {topCareer.matchedSkills?.slice(0, 5).map((sk: any, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-100">
                    ✓ {sk.name} ({sk.proficiency}%)
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Priority Skills to Learn</p>
              <div className="flex flex-wrap gap-1.5">
                {topCareer.missingSkills?.slice(0, 4).map((sk: any, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-medium text-[11px] border border-amber-200">
                    ▲ {sk.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Status Pipeline Overview */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Application Pipeline Status</h3>
          <Link to="/student/applications" className="text-xs font-semibold text-indigo-600 hover:underline">
            View My Applications ({data?.recentApplications?.length || 0})
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
            <p className="text-xl font-bold text-slate-800">{statusSummary.applied || 0}</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Applied</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
            <p className="text-xl font-bold text-blue-700">{statusSummary.under_review || 0}</p>
            <p className="text-[11px] font-medium text-blue-600 mt-0.5">Under Review</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
            <p className="text-xl font-bold text-indigo-700">{statusSummary.shortlisted || 0}</p>
            <p className="text-[11px] font-medium text-indigo-600 mt-0.5">Shortlisted</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
            <p className="text-xl font-bold text-purple-700">{statusSummary.interview || 0}</p>
            <p className="text-[11px] font-medium text-purple-600 mt-0.5">Interview</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
            <p className="text-xl font-bold text-emerald-700">{statusSummary.selected || 0}</p>
            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Selected 🎉</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
            <p className="text-xl font-bold text-rose-700">{statusSummary.rejected || 0}</p>
            <p className="text-[11px] font-medium text-rose-600 mt-0.5">Rejected</p>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Drives & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Recruitment Drives */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Upcoming Campus Drives</h3>
              </div>
              <Link to="/student/drives" className="text-xs font-semibold text-indigo-600 hover:underline">
                All Drives
              </Link>
            </div>

            <div className="space-y-3">
              {data?.upcomingDrives?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No upcoming campus placement drives right now.</p>
              ) : (
                data?.upcomingDrives?.map((drive: any) => (
                  <div key={drive.id} className="p-3.5 rounded-2xl border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{drive.organization_name}</span>
                      <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{drive.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>Date: {drive.drive_date}</span>
                        <span>•</span>
                        <span>Min CGPA: {drive.min_cgpa}</span>
                      </p>
                    </div>
                    <Link
                      to="/student/drives"
                      className="px-3 py-1.5 rounded-xl bg-white text-indigo-600 border border-indigo-200 text-xs font-semibold shrink-0 hover:bg-indigo-50"
                    >
                      Check Eligibility
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900">Recommended Jobs</h3>
              </div>
              <Link to="/student/jobs" className="text-xs font-semibold text-violet-600 hover:underline">
                Job Marketplace
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recommendedJobs?.map((job: any) => (
                <div key={job.id} className="p-3.5 rounded-2xl border border-slate-100 hover:border-violet-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">{job.organization_name}</span>
                    <h4 className="text-xs font-bold text-slate-800 truncate mt-0.5">{job.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span className="capitalize">{job.work_mode}</span>
                      <span>•</span>
                      <span>₹{(job.salary_min / 100000).toFixed(1)} - {(job.salary_max / 100000).toFixed(1)} LPA</span>
                    </p>
                  </div>
                  <Link
                    to="/student/jobs"
                    className="px-3 py-1.5 rounded-xl bg-white text-violet-600 border border-violet-200 text-xs font-semibold shrink-0 hover:bg-violet-50"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Prompt Bar for AI Advisor */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Need Interview or Career Advice?</h4>
            <p className="text-xs text-slate-300">Your AI Advisor is loaded with your skill data and ready to guide you.</p>
          </div>
        </div>
        <Link
          to="/student/advisor"
          className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs transition shrink-0"
        >
          Open Advisor Chat
        </Link>
      </div>
    </div>
  );
};
