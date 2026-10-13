import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Banknote,
  X,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const RecruiterInternships: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Bangalore / Hybrid');
  const [workMode, setWorkMode] = useState('hybrid');
  const [duration, setDuration] = useState('6 Months');
  const [stipend, setStipend] = useState('₹25,000 / month');
  const [skills, setSkills] = useState('Python, SQL, Machine Learning');
  const [eligibility, setEligibility] = useState('Final Year B.Tech / M.Tech students with min 7.0 CGPA');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-11-30');

  const isPending = user?.companyStatus === 'pending';

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ internships: any[] }>('/recruiter/internships');
      if (res) {
        setInternships(res.internships || []);
      }
    } catch (err) {
      console.error('Failed to load recruiter internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setLocation('Bangalore / Hybrid');
    setWorkMode('hybrid');
    setDuration('6 Months');
    setStipend('₹25,000 / month');
    setSkills('Python, React, Data Structures');
    setEligibility('Pre-final & Final year students');
    setApplicationDeadline('2026-11-30');
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setLocation(item.location);
    setWorkMode(item.work_mode || 'hybrid');
    setDuration(item.duration || '6 Months');
    setStipend(item.stipend || '₹20,000 / month');
    setSkills(item.skills || '');
    setEligibility(item.eligibility || '');
    setApplicationDeadline(item.application_deadline ? item.application_deadline.substring(0, 10) : '2026-11-30');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        location,
        workMode,
        duration,
        stipend,
        skills,
        eligibility,
        applicationDeadline,
      };

      if (editingItem) {
        await api.put(`/recruiter/internships/${editingItem.id}`, payload);
        showToast('Internship updated successfully!', 'success');
      } else {
        await api.post('/recruiter/internships', payload);
        showToast('Internship posted successfully!', 'success');
      }

      setModalOpen(false);
      fetchInternships();
    } catch (err: any) {
      showToast(err.message || 'Failed to save internship.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, itemTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${itemTitle}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/recruiter/internships/${id}`);
      showToast('Internship deleted successfully.', 'success');
      fetchInternships();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete internship.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
            Internship Openings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Publish and manage internship opportunities to scout promising student talent.
          </p>
        </div>

        {isPending ? (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Posting disabled while organization is under review
          </div>
        ) : (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-md shadow-indigo-100 hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5" />
            Post New Internship
          </button>
        )}
      </div>

      {/* Internships List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : internships.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Internships Posted Yet</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1 mb-6">
            Attract top collegiate candidates for your summer and semester internship cohorts.
          </p>
          {!isPending && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              Post Your First Internship
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internships.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {item.work_mode || 'Hybrid'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Internship"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete Internship"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 text-sm line-clamp-3 mb-4">{item.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">{item.stipend}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Deadline: {item.application_deadline ? new Date(item.application_deadline).toLocaleDateString() : 'Rolling'}</span>
                  </div>
                </div>

                {item.skills && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.skills.split(',').map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-800 text-sm">{item.applicant_count || 0}</span> Applications received
                </div>
                <Link
                  to={`/recruiter/applications?type=internship`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Applicants →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingItem ? 'Edit Internship' : 'Post New Internship'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Internship Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Research Intern, Frontend Dev Intern"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hyderabad / Hybrid"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Work Mode
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 Months, 6 Months"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Stipend
                  </label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    placeholder="e.g. ₹20,000 / month or Unpaid"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Python, Machine Learning"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Eligibility Criteria
                </label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. B.Tech CS / IT, Min 7.0 CGPA"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Role Description & Responsibilities *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline key deliverables, mentorship, and tech stack..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                  {saving ? 'Saving...' : editingItem ? 'Update Internship' : 'Publish Internship'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
