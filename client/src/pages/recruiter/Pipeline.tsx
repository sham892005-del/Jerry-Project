import React, { useEffect, useState } from 'react';
import {
  Kanban,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  GraduationCap,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

const STAGES = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  { id: 'under_review', label: 'Under Review', color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
  { id: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  { id: 'interview', label: 'Interview', color: 'bg-indigo-500/10 text-indigo-700 border-indigo-200' },
  { id: 'selected', label: 'Selected / Hired', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200' },
  { id: 'rejected', label: 'Rejected', color: 'bg-rose-500/10 text-rose-700 border-rose-200' },
];

export const RecruiterPipeline: React.FC = () => {
  const { showToast } = useNotifications();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<number | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ applications: any[] }>('/recruiter/applications');
      if (res) {
        setApplications(res.applications || []);
      }
    } catch (err: any) {
      console.error('Failed to load pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleMoveStage = async (appId: number, targetStatus: string, currentStatus: string) => {
    setMovingId(appId);
    try {
      await api.patch(`/recruiter/applications/${appId}/status`, {
        status: targetStatus,
        note: `Pipeline transition from ${currentStatus.replace('_', ' ')} to ${targetStatus.replace('_', ' ')}`,
      });

      showToast(`Candidate moved to ${targetStatus.replace('_', ' ').toUpperCase()}`, 'success');
      // Optimistic or fresh reload
      await fetchApplications();
    } catch (err: any) {
      showToast(err.message || 'Failed to move stage.', 'error');
    } finally {
      setMovingId(null);
    }
  };

  const getNextStage = (status: string) => {
    switch (status) {
      case 'applied':
        return 'under_review';
      case 'under_review':
        return 'shortlisted';
      case 'shortlisted':
        return 'interview';
      case 'interview':
        return 'selected';
      default:
        return null;
    }
  };

  const getPrevStage = (status: string) => {
    switch (status) {
      case 'under_review':
        return 'applied';
      case 'shortlisted':
        return 'under_review';
      case 'interview':
        return 'shortlisted';
      case 'selected':
        return 'interview';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Kanban className="h-7 w-7 text-indigo-600" />
            Recruitment Hiring Pipeline
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visual recruitment Kanban board. Progress candidates across screening, interviews, and final selection.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Pipeline
        </button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-6">
          {STAGES.map((stage) => {
            const stageApps = applications.filter((a) => a.status === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col h-[750px] min-w-[240px]"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-800 tracking-wide uppercase">
                      {stage.label}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stage.color}`}>
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {stageApps.length === 0 ? (
                    <div className="h-28 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                      No Candidates
                    </div>
                  ) : (
                    stageApps.map((app) => {
                      const next = getNextStage(app.status);
                      const prev = getPrevStage(app.status);
                      const isMoving = movingId === app.id;

                      return (
                        <div
                          key={app.id}
                          className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-2.5"
                        >
                          <div>
                            <div className="font-bold text-sm text-slate-900 leading-snug">
                              {app.student_name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {app.degree} • {app.branch}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-600">
                            <div className="font-medium text-slate-800 truncate">
                              {app.opportunity_title}
                            </div>
                            <div className="text-slate-400 mt-0.5">
                              Applied: {new Date(app.applied_at).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Quick Stage Progression Buttons */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            {prev && (
                              <button
                                onClick={() => handleMoveStage(app.id, prev, app.status)}
                                disabled={isMoving}
                                title={`Move back to ${prev}`}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {app.status !== 'rejected' && app.status !== 'selected' && (
                              <button
                                onClick={() => handleMoveStage(app.id, 'rejected', app.status)}
                                disabled={isMoving}
                                title="Reject candidate"
                                className="text-[11px] text-rose-600 hover:text-rose-800 font-medium px-1.5 py-0.5 rounded hover:bg-rose-50 transition"
                              >
                                Reject
                              </button>
                            )}

                            {next && (
                              <button
                                onClick={() => handleMoveStage(app.id, next, app.status)}
                                disabled={isMoving}
                                title={`Advance to ${next}`}
                                className="flex items-center gap-1 text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg transition ml-auto"
                              >
                                <span>Advance</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
