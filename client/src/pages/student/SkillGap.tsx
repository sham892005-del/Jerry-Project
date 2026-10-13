import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../../services/api';
import { SkillGapReport } from '../../types';

export const SkillGap: React.FC = () => {
  const [careers, setCareers] = useState<Array<{ id: number; title: string; category: string }>>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<SkillGapReport | null>(null);

  useEffect(() => {
    const fetchCareersList = async () => {
      try {
        const res = await api.get<{ careers: any[] }>('/careers');
        if (res?.careers?.length > 0) {
          setCareers(res.careers);
          setSelectedCareerId(res.careers[0].id);
        }
      } catch (err) {
        console.error('Failed to load careers list:', err);
      }
    };
    fetchCareersList();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedCareerId) return;
      setLoading(true);
      try {
        const data = await api.get<SkillGapReport>(`/student/skill-gap/${selectedCareerId}`);
        setReport(data);
      } catch (err) {
        console.error('Failed to fetch skill gap report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedCareerId]);

  const chartData = report?.skills?.map((s) => ({
    name: s.skillName,
    'Your Level': s.studentProficiency,
    'Required Level': s.requiredProficiency,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full mb-1">
            <BarChart2 className="w-3.5 h-3.5 text-violet-600" />
            <span>Interactive Competency Comparison</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Skill-Gap Analysis Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Benchmark your current verified skill proficiencies against target market career requirements.
          </p>
        </div>

        {/* Career Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 shrink-0">Target Career:</label>
          <select
            value={selectedCareerId}
            onChange={(e) => setSelectedCareerId(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-2xs"
          >
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Top Readiness Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full bg-slate-50 border-4 border-violet-600 flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-2xl font-black text-slate-900">{report.readinessScore}%</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Overall Readiness</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{report.careerTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {report.masteredSkillsCount} of {report.totalRequiredSkills} competencies met
                </p>
              </div>
            </div>

            <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-r from-violet-900 to-indigo-950 text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">Strategic Guidance</span>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed italic">
                  "{report.suggestedAction}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  Top Priority Gaps: <strong className="text-amber-300">{report.prioritySkillsToLearn.join(', ') || 'None!'}</strong>
                </span>
                <Link
                  to="/student/roadmap"
                  className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 transition shrink-0"
                >
                  <Compass className="w-3.5 h-3.5" /> Start Roadmap
                </Link>
              </div>
            </div>
          </div>

          {/* Recharts Bar Comparison Chart */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Proficiency Benchmark: Your Level vs. Target Career Requirement
            </h3>
            <p className="text-xs text-slate-500 mb-6">Values represent percentage mastery (0% - 100%).</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`${value}%`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Your Level" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Required Level" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Skill Cards Grid */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Granular Skill Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.skills.map((sk, idx) => {
                let badge = 'bg-slate-100 text-slate-700';
                let icon = null;

                if (sk.status === 'mastered') {
                  badge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                  icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
                } else if (sk.status === 'proficient') {
                  badge = 'bg-blue-50 text-blue-700 border border-blue-200';
                } else if (sk.status === 'developing') {
                  badge = 'bg-amber-50 text-amber-800 border border-amber-200';
                  icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
                } else {
                  badge = 'bg-rose-50 text-rose-700 border border-rose-200';
                }

                return (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800">{sk.skillName}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge}`}>
                          {icon}
                          <span>{sk.status}</span>
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        {sk.importance} • {sk.category}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Your Proficiency:</span>
                        <span className="font-bold text-indigo-600">{sk.studentProficiency}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden relative">
                        {/* Target Marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                          style={{ left: `${sk.requiredProficiency}%` }}
                          title={`Required: ${sk.requiredProficiency}%`}
                        ></div>
                        {/* Student Bar */}
                        <div
                          className={`h-full rounded-full ${
                            sk.studentProficiency >= sk.requiredProficiency ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${sk.studentProficiency}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Target: {sk.requiredProficiency}%</span>
                        {sk.gap > 0 ? (
                          <span className="text-amber-600 font-bold">Gap: -{sk.gap}%</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Target Exceeded!</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
