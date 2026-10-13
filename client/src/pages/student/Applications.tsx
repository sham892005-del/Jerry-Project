import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  Briefcase,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { Application } from '../../types';

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ applications: Application[] }>('/student/applications');
      if (res) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Applied</span>;
      case 'under_review':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Under Review</span>;
      case 'shortlisted':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Shortlisted</span>;
      case 'interview':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Interview Scheduled</span>;
      case 'selected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Selected 🎉</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Archived / Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hiring Tracker</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Applications & Selection Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Live status updates dispatched directly by partner organization recruiters.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <span>Total Submissions:</span>
          <span className="font-extrabold text-indigo-600">{applications.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Applications Submitted Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse verified jobs, internships, and campus placement drives to submit your credentials.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link to="/student/jobs" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-xs">
              Explore Jobs
            </Link>
            <Link to="/student/drives" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200">
              Campus Drives
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">
                    {app.company_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      {app.company_name} • {app.item_type.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {app.opportunity_title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {/* Recruiter Notes if any */}
              {app.notes && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900 block mb-0.5">Recruiter Feedback / Notes:</span>
                  <p className="italic text-slate-600">"{app.notes}"</p>
                </div>
              )}

              {/* Visual Application Status Timeline */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Recruitment Progression Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {app.timeline?.map((evt, idx) => {
                    const isLatest = idx === app.timeline.length - 1;
                    return (
                      <div key={idx} className="relative">
                        <div
                          className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white ${
                            isLatest
                              ? 'border-indigo-600 ring-4 ring-indigo-50'
                              : 'border-slate-300'
                          }`}
                        ></div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 capitalize">
                              {evt.status?.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(evt.date).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {evt.note && (
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{evt.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
