import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Search,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Clock,
  ShieldCheck,
  Send,
  X,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { RecruitmentDrive } from '../../types';

export const Drives: React.FC = () => {
  const { showToast } = useNotifications();
  const [drives, setDrives] = useState<RecruitmentDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedDrive, setSelectedDrive] = useState<RecruitmentDrive | null>(null);
  const [notes, setNotes] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await api.get<{ drives: RecruitmentDrive[] }>(`/student/drives?${params.toString()}`);
      if (res) {
        setDrives(res.drives || []);
      }
    } catch (err) {
      console.error('Failed to load recruitment drives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleToggleBookmark = async (driveId: number) => {
    try {
      const res = await api.post<{ bookmarked: boolean; message: string }>('/student/bookmarks/toggle', {
        itemType: 'drive',
        itemId: driveId,
      });
      showToast(res.message, 'info');
      setDrives((prev) =>
        prev.map((d) => (d.id === driveId ? { ...d, is_bookmarked: res.bookmarked } : d))
      );
    } catch (err: any) {
      showToast('Failed to toggle bookmark.', 'error');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrive) return;

    setApplying(true);
    try {
      const res = await api.post<{ message: string; status: string }>('/student/apply', {
        itemType: 'drive',
        itemId: selectedDrive.id,
        notes,
      });
      showToast(res.message, 'success');
      setDrives((prev) =>
        prev.map((d) => (d.id === selectedDrive.id ? { ...d, application_status: res.status } : d))
      );
      setSelectedDrive(null);
      setNotes('');
    } catch (err: any) {
      showToast(err.message || 'Failed to register for drive.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Campus Placements</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recruitment & Campus Placement Drives
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Participate in official recruitment drives with real-time academic eligibility gating and selection process tracking.
        </p>
      </div>

      {/* Drives List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : drives.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No recruitment drives currently scheduled.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {drives.map((drive) => (
            <div
              key={drive.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs hover:border-emerald-200 hover:shadow-md transition space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0 border border-emerald-100">
                    {drive.organization_name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                      {drive.organization_name}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{drive.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Real-time eligibility badge */}
                  {drive.is_eligible ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>You Meet Eligibility</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Ineligible</span>
                    </span>
                  )}

                  <button
                    onClick={() => handleToggleBookmark(drive.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-slate-50 transition"
                  >
                    {drive.is_bookmarked ? (
                      <BookmarkCheck className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {drive.description}
              </p>

              {/* Drive Logistics & Criteria Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Drive Schedule & Venue</span>
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> {drive.drive_date}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{drive.venue_or_link}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Academic Criteria</span>
                  <p className="font-semibold text-slate-800">Min CGPA: {drive.min_cgpa}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{drive.required_branch || 'All Branches'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Selection Rounds</span>
                  <p className="text-[11px] text-slate-700 leading-snug font-medium">
                    {drive.selection_process || 'Coding Round -> Technical Interview -> HR'}
                  </p>
                </div>
              </div>

              {/* Eligibility explanation notice */}
              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Verification check: {drive.eligibility_reason}</span>
              </div>

              {/* Action Bar */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Registration Closes: <strong>{drive.application_deadline}</strong>
                </span>

                {drive.application_status ? (
                  <span className="px-4 py-2 rounded-xl text-xs font-bold capitalize bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Registered ({drive.application_status})
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedDrive(drive)}
                    disabled={!drive.is_eligible}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition ${
                      drive.is_eligible
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {drive.is_eligible ? 'Register for Placement Drive' : 'Criteria Not Met'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  Campus Drive Registration
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedDrive.title}</h3>
                <p className="text-xs text-slate-500">{selectedDrive.organization_name} • Date: {selectedDrive.drive_date}</p>
              </div>
              <button
                onClick={() => setSelectedDrive(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              Your profile has been validated against the minimum CGPA ({selectedDrive.min_cgpa}) and branch requirement. Your hall ticket will be assigned upon submission.
            </p>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Candidate Notes / Special Accommodations (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special remarks or query for the campus recruitment coordinator..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDrive(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  {applying ? 'Registering...' : <><Send className="w-3.5 h-3.5" /> Confirm Registration</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
