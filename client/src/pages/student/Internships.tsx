import React, { useEffect, useState } from 'react';
import {
  Clock,
  Search,
  MapPin,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Building2,
  X,
  Send,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Internship } from '../../types';

export const Internships: React.FC = () => {
  const { showToast } = useNotifications();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('all');

  const [selectedItem, setSelectedItem] = useState<Internship | null>(null);
  const [notes, setNotes] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (workMode !== 'all') params.append('workMode', workMode);

      const res = await api.get<{ internships: Internship[] }>(`/student/internships?${params.toString()}`);
      if (res) {
        setInternships(res.internships || []);
      }
    } catch (err) {
      console.error('Failed to load internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [workMode]);

  const handleToggleBookmark = async (id: number) => {
    try {
      const res = await api.post<{ bookmarked: boolean; message: string }>('/student/bookmarks/toggle', {
        itemType: 'internship',
        itemId: id,
      });
      showToast(res.message, 'info');
      setInternships((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_bookmarked: res.bookmarked } : i))
      );
    } catch (err: any) {
      showToast('Failed to toggle bookmark.', 'error');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setApplying(true);
    try {
      const res = await api.post<{ message: string; status: string }>('/student/apply', {
        itemType: 'internship',
        itemId: selectedItem.id,
        notes,
      });
      showToast(res.message, 'success');
      setInternships((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, application_status: res.status } : i))
      );
      setSelectedItem(null);
      setNotes('');
    } catch (err: any) {
      showToast(err.message || 'Application failed.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full mb-1">
          <Clock className="w-3.5 h-3.5 text-violet-600" />
          <span>Student Programs</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Internship Opportunities
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Gain hands-on industry experience with paid stipends and direct Pre-Placement Offer (PPO) tracks.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search internships by skill or company..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <select
          value={workMode}
          onChange={(e) => setWorkMode(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
        >
          <option value="all">All Work Modes</option>
          <option value="remote">Remote Only</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">On-Site</option>
        </select>
      </div>

      {/* Internships Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-violet-200 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider block">
                    {item.organization_name}
                  </span>
                  <button
                    onClick={() => handleToggleBookmark(item.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-violet-600"
                  >
                    {item.is_bookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-violet-600 fill-violet-100" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {item.duration}
                  </span>
                  <span className="capitalize bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {item.work_mode}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-100">
                    {item.stipend}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Deadline: {item.application_deadline ? new Date(item.application_deadline).toLocaleDateString() : 'Rolling'}
                </span>

                {item.application_status ? (
                  <span className="px-3 py-1 rounded-xl text-xs font-bold capitalize bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ {item.application_status.replace('_', ' ')}
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">
                  Internship Application
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedItem.title}</h3>
                <p className="text-xs text-slate-500">{selectedItem.organization_name} • {selectedItem.duration}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Why are you a strong candidate for this internship? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention relevant coursework, GitHub repositories, or previous internships..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {applying ? 'Submitting...' : <><Send className="w-3.5 h-3.5" /> Submit</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
