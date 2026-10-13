import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export const AdminModeration: React.FC = () => {
  const { showToast } = useNotifications();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ items: any[] }>('/admin/moderation');
      if (res) {
        setItems(res.items || []);
      }
    } catch (err: any) {
      console.error('Failed to load moderation items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleModerateAction = async (type: string, id: number, action: 'publish' | 'reject' | 'close') => {
    const key = `${type}-${id}`;
    setActionInProgress(key);
    try {
      await api.post('/admin/moderation/action', { type, id, action });
      showToast(`Item ${action === 'publish' ? 'approved & published' : action} successfully!`, 'success');
      fetchItems();
    } catch (err: any) {
      showToast(err.message || 'Moderation action failed.', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'internship':
        return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case 'course':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'drive':
        return <Calendar className="h-4 w-4 text-rose-500" />;
      default:
        return <Briefcase className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredItems = items.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        item.title?.toLowerCase().includes(term) ||
        item.organization_name?.toLowerCase().includes(term) ||
        item.provider?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-indigo-600" />
            Opportunity & Content Moderation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Ensure platform safety, compliance, and academic integrity across posted opportunities and curriculum.
          </p>
        </div>

        <div className="text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          {filteredItems.length} Postings Listed
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search posting title or publisher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Content Types</option>
            <option value="job">Jobs</option>
            <option value="internship">Internships</option>
            <option value="course">Courses</option>
            <option value="drive">Campus Drives</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <ShieldAlert className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Postings Found</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1">
            No content matches your filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Posting Title</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Publisher / Organization</th>
                  <th className="px-6 py-3.5">Date Created</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Moderator Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const key = `${item.type}-${item.id}`;
                  const isOperating = actionInProgress === key;

                  return (
                    <tr key={key} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.location || 'Online / Remote'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 capitalize">
                          {getTypeIcon(item.type)}
                          <span>{item.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {item.organization_name || item.provider || 'Internal Academy'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                            item.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'published' && (
                            <button
                              onClick={() => handleModerateAction(item.type, item.id, 'publish')}
                              disabled={isOperating}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition"
                            >
                              Publish
                            </button>
                          )}
                          {item.status !== 'rejected' && (
                            <button
                              onClick={() => handleModerateAction(item.type, item.id, 'reject')}
                              disabled={isOperating}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition"
                            >
                              Reject
                            </button>
                          )}
                          {item.status !== 'closed' && (
                            <button
                              onClick={() => handleModerateAction(item.type, item.id, 'close')}
                              disabled={isOperating}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
