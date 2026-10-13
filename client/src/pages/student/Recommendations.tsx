import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Compass,
  BookOpen,
  DollarSign,
} from 'lucide-react';
import { api } from '../../services/api';
import { CareerRecommendation } from '../../types';

export const Recommendations: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<string>('deterministic-engine');
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerRecommendation | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const res = await api.get<{ provider: string; recommendations: CareerRecommendation[] }>(
          '/student/recommendations'
        );
        if (res) {
          setProvider(res.provider);
          setRecommendations(res.recommendations || []);
          if (res.recommendations?.length > 0) {
            setSelectedCareer(res.recommendations[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load career recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Match Engine • {provider === 'gemini' ? 'Gemini 1.5 Pro Model' : 'Algorithmic Evaluator'}</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Top 5 AI Career Recommendations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Calculated based on your verified degree, branch, CGPA, technical competencies, and declared career goals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/skill-gap"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <BarChart2 className="w-4 h-4 text-violet-600" />
            <span>Open Skill-Gap Tool</span>
          </Link>
          <Link
            to="/student/roadmap"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
          >
            <Compass className="w-4 h-4" />
            <span>View Roadmap</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Career Cards List (Left) and Detail View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Top 5 Career Cards */}
        <div className="lg:col-span-5 space-y-3">
          {recommendations.map((c, idx) => {
            const isSelected = selectedCareer?.careerId === c.careerId;
            let matchBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (c.matchPercentage < 70) matchBg = 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={c.careerId}
                onClick={() => setSelectedCareer(c)}
                className={`p-4 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50/40 border-indigo-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rank #{idx + 1} • {c.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{c.title}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${matchBg}`}>
                    {c.matchPercentage}%
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-slate-600">Growth: {c.growthRate}</span>
                  <span className="text-indigo-600 font-semibold flex items-center gap-0.5">
                    Inspect Match <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Career In-Depth Breakdown */}
        {selectedCareer && (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Detail Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {selectedCareer.category}
                </span>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {selectedCareer.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Average Compensation: {selectedCareer.averageSalary}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-center">
                  <span className="text-2xl font-extrabold leading-none block">{selectedCareer.matchPercentage}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Profile Match</span>
                </div>
              </div>
            </div>

            {/* AI Reasoning Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/70 border border-indigo-100/80">
              <div className="flex items-center gap-2 mb-2 text-indigo-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Why This Career Matches Your Profile</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                "{selectedCareer.reasoning}"
              </p>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Matched */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Skills You Possess ({selectedCareer.matchedSkills?.length || 0})</span>
                </div>
                <div className="space-y-1.5">
                  {selectedCareer.matchedSkills?.map((sk, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-800">{sk.name}</span>
                      <span className="text-emerald-700 font-bold">{sk.proficiency}%</span>
                    </div>
                  ))}
                  {selectedCareer.matchedSkills?.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No direct overlap recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Missing / Gaps */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Missing Priority Skills ({selectedCareer.missingSkills?.length || 0})</span>
                </div>
                <div className="space-y-1.5">
                  {selectedCareer.missingSkills?.map((sk, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="font-semibold text-slate-800">{sk.name}</span>
                      <span className="text-amber-800 text-[11px] font-semibold">Target: {sk.requiredProficiency}%</span>
                    </div>
                  ))}
                  {selectedCareer.missingSkills?.length === 0 && (
                    <p className="text-xs text-emerald-600 font-medium">All prerequisite skills satisfied! 🎉</p>
                  )}
                </div>
              </div>
            </div>

            {/* Suggested Next Steps */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Suggested Next Steps</h4>
              <div className="space-y-2">
                {selectedCareer.suggestedNextSteps?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Learning Courses */}
            {selectedCareer.recommendedCourses?.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Recommended Learning Modules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCareer.recommendedCourses.map((crs) => (
                    <div key={crs.id} className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-200 transition flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-indigo-600">{crs.provider}</span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">{crs.title}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px]">
                        <span className="capitalize text-slate-500">{crs.level}</span>
                        <span className="font-bold text-emerald-600 uppercase">{crs.priceType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to={`/student/skill-gap`}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <BarChart2 className="w-4 h-4" />
                <span>Deep Skill-Gap Comparison</span>
              </Link>
              <Link
                to={`/student/roadmap`}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Compass className="w-4 h-4" />
                <span>Launch Learning Roadmap</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
