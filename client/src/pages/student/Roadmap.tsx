import React, { useEffect, useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { RoadmapStage } from '../../types';

export const Roadmap: React.FC = () => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [stages, setStages] = useState<RoadmapStage[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRoadmap = async () => {
    try {
      const res = await api.get<{ roadmap: any; items: RoadmapStage[] }>('/student/roadmap');
      if (res) {
        setRoadmap(res.roadmap);
        setStages(res.items || []);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleStage = async (itemId: number) => {
    setUpdatingId(itemId);
    try {
      const res = await api.patch<{ message: string; isCompleted: boolean; completedStages: number }>(
        `/student/roadmap/stage/${itemId}`
      );
      showToast(res.message, res.isCompleted ? 'success' : 'info');

      // Update local state
      setStages((prev) =>
        prev.map((st) => (st.id === itemId ? { ...st, is_completed: res.isCompleted } : st))
      );
      if (roadmap) {
        setRoadmap({ ...roadmap, completed_stages: res.completedStages });
      }
    } catch (err: any) {
      showToast('Failed to update stage completion.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const completedCount = roadmap?.completed_stages || 0;
  const totalCount = roadmap?.total_stages || 6;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
            <Compass className="w-3.5 h-3.5 text-indigo-600" />
            <span>Target Role: {roadmap?.target_role || 'Software Engineering'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {roadmap?.title || 'Personalized Learning Roadmap'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Follow this 6-stage structured milestone plan. Check off completed stages as you progress.
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs sm:min-w-[200px]">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5 text-slate-800">
            <span>Progress</span>
            <span className="text-indigo-600">{completedCount} of {totalCount} ({progressPercent}%)</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="space-y-4">
        {stages.map((stage) => {
          const isDone = stage.is_completed;
          const isBusy = updatingId === stage.id;

          return (
            <div
              key={stage.id}
              className={`p-6 rounded-3xl border transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-50/20 border-emerald-200'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => handleToggleStage(stage.id)}
                    disabled={isBusy}
                    className={`mt-1 shrink-0 p-1 rounded-xl transition ${
                      isDone
                        ? 'text-emerald-600 hover:text-emerald-700'
                        : 'text-slate-300 hover:text-indigo-600'
                    }`}
                    title={isDone ? 'Mark as incomplete' : 'Mark stage complete'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Stage {stage.stage_number}
                      </span>
                      {isDone && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          Completed ✓
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-bold mt-0.5 ${isDone ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                      {stage.stage_title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{stage.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{stage.estimated_duration}</span>
                </div>
              </div>

              {/* Skills & Resources Pills */}
              <div className="mt-4 pt-4 border-t border-slate-100/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Skills Covered in this Stage:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stage.skills?.map((sk, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50/80 text-indigo-700 text-[11px] font-medium border border-indigo-100"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Recommended Study Resources:
                  </span>
                  <div className="space-y-1">
                    {stage.resources?.map((res, i) => (
                      <p key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        <span>{res}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
