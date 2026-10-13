import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Building2,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Job } from '../../types';

export const Jobs: React.FC = () => {
  const { showToast } = useNotifications();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('all');
  const [experience, setExperience] = useState('all');

  // Application Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [notes, setNotes] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (workMode !== 'all') params.append('workMode', workMode);
      if (experience !== 'all') params.append('experience', experience);

      const res = await api.get<{ jobs: Job[] }>(`/student/jobs?${params.toString()}`);
      if (res) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode, experience]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleBookmark = async (jobId: number) => {
    try {
      const res = await api.post<{ bookmarked: boolean; message: string }>('/student/bookmarks/toggle', {
        itemType: 'job',
        itemId: jobId,
      });
      showToast(res.message, 'info');
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, is_bookmarked: res.bookmarked } : j))
      );
    } catch (err: any) {
      showToast('Failed to toggle bookmark.', 'error');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setApplying(true);
    try {
      const res = await api.post<{ message: string; status: string }>('/student/apply', {
        itemType: 'job',
        itemId: selectedJob.id,
        notes,
      });
      showToast(res.message, 'success');

      // Update state
      setJobs((prev) =>
        prev.map((j) => (j.id === selectedJob.id ? { ...j, application_status: res.status } : j))
      );
      setSelectedJob(null);
      setNotes('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
          <span>Verified Opportunities</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Job Marketplace
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Apply directly to campus recruitment partners with your verified academic profile and skills.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, or skills..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Work Modes</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-Site</option>
          </select>

          <select
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Experience Level</option>
            <option value="Fresher">Fresher / Junior (0-1 Yrs)</option>
            <option value="1-3 Years">1-3 Years</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No jobs match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">
                      {job.organization_name?.charAt(0) || 'C'}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block truncate">
                        {job.organization_name}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-snug truncate">
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(job.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition shrink-0"
                    title={job.is_bookmarked ? 'Remove bookmark' : 'Bookmark job'}
                  >
                    {job.is_bookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-4">
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <MapPin className="w-3 h-3 text-slate-400" /> {job.location}
                  </span>
                  <span className="capitalize bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium">
                    {job.work_mode}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                    ₹{(job.salary_min / 100000).toFixed(1)} - {(job.salary_max / 100000).toFixed(1)} LPA
                  </span>
                </div>

                {job.required_skills && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.required_skills.split(',').map((sk, i) => (
                      <span key={i} className="text-[10px] bg-indigo-50/60 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Deadline: {job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'Rolling'}
                </span>

                {job.application_status ? (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold capitalize bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ {job.application_status.replace('_', ' ')}
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    Quick Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Submission Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Submit Application
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500">{selectedJob.organization_name} • {selectedJob.location}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <p className="font-semibold">Automatic Profile Submission:</p>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Your verified academic record, degree, branch, CGPA, and skill competencies will be presented directly to the recruiter's hiring dashboard.
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Note / Pitch to Recruiter (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain why you are excited for this opportunity and highlight your relevant project builds..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {applying ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
