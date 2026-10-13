import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Eye,
  MessageSquare,
  X,
  Send,
  Briefcase,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useSearchParams } from 'react-router-dom';

export const RecruiterApplications: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'all';

  const { showToast } = useNotifications();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState(initialType);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Status Change Modal
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Detail / Timeline Modal
  const [viewApp, setViewApp] = useState<any | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ applications: any[] }>(
        `/recruiter/applications?type=${filterType}&status=${filterStatus}`
      );
      if (res) {
        setApplications(res.applications || []);
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterType, filterStatus]);

  const openStatusModal = (app: any) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      await api.patch(`/recruiter/applications/${selectedApp.id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
      });

      showToast(`Application updated to ${newStatus.toUpperCase()}`, 'success');
      setSelectedApp(null);
      fetchApplications();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Applied</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Under Review</span>;
      case 'shortlisted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">Shortlisted</span>;
      case 'interview':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Interview</span>;
      case 'selected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Selected</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'internship':
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case 'drive':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Briefcase className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredApps = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.student_name?.toLowerCase().includes(term) ||
      app.opportunity_title?.toLowerCase().includes(term) ||
      app.branch?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-600" />
            Candidate Applications & Review
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review student candidate submissions, evaluate profiles, and progress applicants through hiring stages.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <span className="font-semibold text-slate-900">{filteredApps.length}</span> Total Candidates Found
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, opportunity, or branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
            <option value="drive">Campus Drives</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Stages</option>
            <option value="applied">Applied</option>
            <option value="under_review">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Candidate Applications Found</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1">
            As students apply to your jobs, internships, or campus drives, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Candidate</th>
                  <th className="px-6 py-3.5">Opportunity</th>
                  <th className="px-6 py-3.5">Education / CGPA</th>
                  <th className="px-6 py-3.5">Applied Date</th>
                  <th className="px-6 py-3.5">Current Stage</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{app.student_name}</div>
                      <div className="text-xs text-slate-500">
                        {app.student_email || 'Email private'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        {getTypeIcon(app.item_type)}
                        <span>{app.opportunity_title}</span>
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                        {app.item_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {app.degree} - {app.branch}
                      </div>
                      <div className="text-xs text-slate-500">
                        CGPA: <span className="font-semibold text-slate-700">{app.cgpa}</span> | Batch {app.graduation_year}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(app.applied_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewApp(app)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title="View Application Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openStatusModal(app)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
                        >
                          Change Stage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Update Application Stage</h2>
                <p className="text-xs text-slate-500">{selectedApp.student_name} • {selectedApp.opportunity_title}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Pipeline Stage *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="applied">Applied</option>
                  <option value="under_review">Under Review / Screening</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="selected">Offer Extended / Selected</option>
                  <option value="rejected">Rejected / Not Selected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Status Update Note / Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Cleared technical interview round 1; invitation sent for leadership round."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This note will be automatically sent to the student as an in-app notification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                  {updating ? 'Updating...' : 'Save Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Detail / Timeline Modal */}
      {viewApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{viewApp.student_name}</h2>
                <p className="text-xs text-slate-500">Candidate Profile & History</p>
              </div>
              <button
                onClick={() => setViewApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-sm">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Opportunity:</span>
                  <span className="font-semibold text-slate-800">{viewApp.opportunity_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Degree & Branch:</span>
                  <span className="font-medium text-slate-800">{viewApp.degree} • {viewApp.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CGPA:</span>
                  <span className="font-medium text-slate-800">{viewApp.cgpa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-medium text-slate-800">{viewApp.student_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-medium text-slate-800">{viewApp.phone}</span>
                </div>
              </div>

              {viewApp.cover_letter && (
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
                    Candidate Statement / Cover Letter
                  </h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl text-xs italic">
                    "{viewApp.cover_letter}"
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Application Timeline Events
                </h4>
                <div className="space-y-2">
                  {viewApp.timeline && viewApp.timeline.length > 0 ? (
                    viewApp.timeline.map((event: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <Clock className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-slate-800 capitalize">
                            {event.status?.replace('_', ' ')}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {new Date(event.date).toLocaleString()}
                          </div>
                          {event.note && (
                            <div className="text-slate-700 mt-1 font-medium">{event.note}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400">No timeline history recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewApp(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
