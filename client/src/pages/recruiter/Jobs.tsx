import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  X,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const RecruiterJobs: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Bangalore, India');
  const [workMode, setWorkMode] = useState('hybrid');
  const [salaryMin, setSalaryMin] = useState('700000');
  const [salaryMax, setSalaryMax] = useState('1400000');
  const [experienceLevel, setExperienceLevel] = useState('0-2 Years (Fresher / Junior)');
  const [requiredDegree, setRequiredDegree] = useState('B.Tech / B.E.');
  const [requiredBranch, setRequiredBranch] = useState('Computer Science, IT, ECE');
  const [requiredSkills, setRequiredSkills] = useState('React, TypeScript, Node.js, SQL');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-12-31');

  const isPending = user?.companyStatus === 'pending';

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ jobs: any[] }>('/recruiter/jobs');
      if (res) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenCreate = () => {
    if (isPending) {
      showToast('Account is pending admin verification. Cannot publish listings yet.', 'warning');
      return;
    }
    setEditingJob(null);
    setTitle('');
    setDescription('');
    setLocation('Bangalore, India');
    setWorkMode('hybrid');
    setSalaryMin('700000');
    setSalaryMax('1400000');
    setExperienceLevel('0-2 Years');
    setRequiredDegree('B.Tech / B.E.');
    setRequiredBranch('Computer Science, IT');
    setRequiredSkills('React, TypeScript, Node.js, SQL');
    setApplicationDeadline('2026-12-31');
    setModalOpen(true);
  };

  const handleOpenEdit = (job: any) => {
    setEditingJob(job);
    setTitle(job.title || '');
    setDescription(job.description || '');
    setLocation(job.location || '');
    setWorkMode(job.work_mode || 'hybrid');
    setSalaryMin(String(job.salary_min || '700000'));
    setSalaryMax(String(job.salary_max || '1400000'));
    setExperienceLevel(job.experience_level || '0-2 Years');
    setRequiredDegree(job.required_degree || 'B.Tech / B.E.');
    setRequiredBranch(job.required_branch || 'Computer Science, IT');
    setRequiredSkills(job.required_skills || '');
    setApplicationDeadline(job.application_deadline || '2026-12-31');
    setModalOpen(true);
  };

  const handleDelete = async (jobId: number) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/recruiter/jobs/${jobId}`);
      showToast('Job listing deleted.', 'info');
      fetchJobs();
    } catch (err: any) {
      showToast('Failed to delete job.', 'error');
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        location,
        workMode,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        experienceLevel,
        requiredDegree,
        requiredBranch,
        requiredSkills,
        applicationDeadline,
      };

      if (editingJob) {
        await api.put(`/recruiter/jobs/${editingJob.id}`, payload);
        showToast('Job posting updated successfully!', 'success');
      } else {
        await api.post('/recruiter/jobs', payload);
        showToast('New job posted successfully!', 'success');
      }

      setModalOpen(false);
      fetchJobs();
    } catch (err: any) {
      showToast(err.message || 'Failed to save job.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full mb-1">
            <Briefcase className="w-3.5 h-3.5 text-violet-600" />
            <span>Recruiter Workspace</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Manage Job Postings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create and maintain employment opportunities. Applicants will appear in your visual pipeline.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {isPending && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold">Organization Approval Pending:</span> You cannot publish new listings until an administrator reviews and verifies your organization account.
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No active job listings.</p>
          <p className="text-xs text-slate-400 mt-1">Click "Post New Opportunity" above to publish a position.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-violet-200 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">
                    {job.work_mode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(job)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-slate-50 transition"
                      title="Edit Job"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> {job.location} • ₹{(job.salary_min / 100000).toFixed(1)} - {(job.salary_max / 100000).toFixed(1)} LPA
                </p>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {job.required_skills && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.required_skills.split(',').map((sk: string, i: number) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {job.applicant_count || 0} Candidate Applicants
                </span>

                <Link
                  to="/recruiter/applications"
                  className="text-violet-600 font-semibold hover:underline"
                >
                  Manage Applicants →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingJob ? 'Edit Job Posting' : 'Post New Job Opportunity'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Junior Full Stack Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white"
                  >
                    <option value="onsite">On-Site</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Salary (INR / yr)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Salary (INR / yr)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Node.js, SQL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description & Responsibilities</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : <><Send className="w-3.5 h-3.5" /> Save Opportunity</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
