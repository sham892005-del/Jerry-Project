import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Award,
  Clock,
  X,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const RecruiterDrives: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [driveDate, setDriveDate] = useState('2026-10-15');
  const [venue, setVenue] = useState('Main Campus Auditorium & Lab Complex');
  const [eligibility, setEligibility] = useState('B.Tech 2026 Batch with 7.0+ CGPA and no active backlogs');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [requiredDegree, setRequiredDegree] = useState('B.Tech / B.E. / M.Tech');
  const [requiredBranch, setRequiredBranch] = useState('CSE, IT, ECE, AI & DS');
  const [requiredSkills, setRequiredSkills] = useState('Data Structures, Algorithms, System Design, SQL');
  const [selectionProcess, setSelectionProcess] = useState('Round 1: Online Aptitude & Coding -> Round 2: Technical Interview -> Round 3: Leadership/HR');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-10-10');

  const isPending = user?.companyStatus === 'pending';

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ drives: any[] }>('/recruiter/drives');
      if (res) {
        setDrives(res.drives || []);
      }
    } catch (err) {
      console.error('Failed to load recruiter drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setDescription('');
    setDriveDate('2026-10-15');
    setVenue('Main Campus Auditorium / Virtual Portal');
    setEligibility('B.Tech 2026 graduating batch, min 7.0 CGPA');
    setMinCgpa('7.0');
    setRequiredDegree('B.Tech / B.E.');
    setRequiredBranch('CSE, IT, ECE');
    setRequiredSkills('Data Structures, Java/Python, Problem Solving');
    setSelectionProcess('Online Coding Test -> Technical Interview -> HR Round');
    setApplicationDeadline('2026-10-10');
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
    setDriveDate(item.drive_date ? item.drive_date.substring(0, 10) : '2026-10-15');
    setVenue(item.venue_or_link || 'Campus Auditorium');
    setEligibility(item.eligibility || '');
    setMinCgpa(String(item.min_cgpa || '7.0'));
    setRequiredDegree(item.required_degree || 'B.Tech');
    setRequiredBranch(item.required_branch || 'CSE, IT');
    setRequiredSkills(item.required_skills || '');
    setSelectionProcess(item.selection_process || '');
    setApplicationDeadline(item.application_deadline ? item.application_deadline.substring(0, 10) : '2026-10-10');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !driveDate || !applicationDeadline) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        driveDate,
        venue,
        eligibility,
        minCgpa: Number(minCgpa) || 7.0,
        requiredDegree,
        requiredBranch,
        requiredSkills,
        selectionProcess,
        applicationDeadline,
      };

      if (editingItem) {
        await api.put(`/recruiter/drives/${editingItem.id}`, payload);
        showToast('Recruitment drive updated successfully!', 'success');
      } else {
        await api.post('/recruiter/drives', payload);
        showToast('Campus recruitment drive scheduled successfully!', 'success');
      }

      setModalOpen(false);
      fetchDrives();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule drive.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, itemTitle: string) => {
    if (!window.confirm(`Are you sure you want to cancel recruitment drive "${itemTitle}"?`)) {
      return;
    }
    try {
      await api.delete(`/recruiter/drives/${id}`);
      showToast('Recruitment drive removed.', 'success');
      fetchDrives();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete recruitment drive.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-indigo-600" />
            Campus Recruitment Drives
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Host pooled and on-campus hiring drives with real-time student eligibility filtering.
          </p>
        </div>

        {isPending ? (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Drive scheduling disabled while organization is pending
          </div>
        ) : (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-md shadow-indigo-100 hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5" />
            Schedule New Drive
          </button>
        )}
      </div>

      {/* Drives List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : drives.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Recruitment Drives Scheduled</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1 mb-6">
            Engage directly with college batches by hosting an on-campus or virtual recruitment drive.
          </p>
          {!isPending && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              Schedule First Drive
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      Campus Placement Drive
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Drive"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete Drive"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 text-sm line-clamp-3 mb-4">{item.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="font-semibold text-slate-800">
                      {new Date(item.drive_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <span>Min CGPA: {item.min_cgpa}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{item.venue_or_link}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                    <span>Reg. Closes: {new Date(item.application_deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 mb-4 space-y-1">
                  <div>
                    <span className="font-medium text-slate-700">Eligible:</span> {item.required_degree} ({item.required_branch})
                  </div>
                  {item.selection_process && (
                    <div className="truncate">
                      <span className="font-medium text-slate-700">Process:</span> {item.selection_process}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  <span className="font-bold text-slate-800 text-sm">{item.applicant_count || 0}</span> Registrations
                </div>
                <Link
                  to={`/recruiter/applications?type=drive`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  View Registrations →
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
                {editingItem ? 'Edit Recruitment Drive' : 'Schedule Campus Drive'}
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
                  Drive Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Campus Hiring Blitz 2026"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Drive Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={driveDate}
                    onChange={(e) => setDriveDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Venue / Meeting Link *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Campus Auditorium or Virtual Video Link"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Min CGPA
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    placeholder="7.0"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Required Degree
                  </label>
                  <input
                    type="text"
                    value={requiredDegree}
                    onChange={(e) => setRequiredDegree(e.target.value)}
                    placeholder="B.Tech / B.E."
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Branches
                  </label>
                  <input
                    type="text"
                    value={requiredBranch}
                    onChange={(e) => setRequiredBranch(e.target.value)}
                    placeholder="CSE, IT, ECE"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Eligibility Criteria Note
                </label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  placeholder="e.g. 2026 batch candidates with no active standing backlogs"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Hiring Workflow & Selection Rounds
                </label>
                <input
                  type="text"
                  value={selectionProcess}
                  onChange={(e) => setSelectionProcess(e.target.value)}
                  placeholder="Online Test -> Technical Interview -> HR Round"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Drive Overview & Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline expected roles, packages, batch size, and preparation guidelines..."
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
                  {saving ? 'Saving...' : editingItem ? 'Update Drive' : 'Schedule Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
