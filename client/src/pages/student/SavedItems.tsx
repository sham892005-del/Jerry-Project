import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Briefcase,
  Clock,
  BookOpen,
  Calendar,
  Trash2,
  ExternalLink,
  MapPin,
  Star,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export const SavedItems: React.FC = () => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'internships' | 'courses' | 'drives'>('jobs');
  const [data, setData] = useState<{
    jobs: any[];
    internships: any[];
    courses: any[];
    drives: any[];
  }>({
    jobs: [],
    internships: [],
    courses: [],
    drives: [],
  });

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/student/bookmarks');
      if (res) {
        setData({
          jobs: res.jobs || [],
          internships: res.internships || [],
          courses: res.courses || [],
          drives: res.drives || [],
        });
      }
    } catch (err) {
      console.error('Failed to load saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (itemType: string, itemId: number) => {
    try {
      await api.post('/student/bookmarks/toggle', { itemType, itemId });
      showToast('Removed from saved items.', 'info');
      fetchBookmarks();
    } catch (err) {
      showToast('Failed to remove bookmark.', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
          <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
          <span>Saved Collection</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Saved Opportunities & Learning
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review bookmarked jobs, internships, courses, and campus recruitment drives.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'jobs' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Saved Jobs ({data.jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('internships')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'internships' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Internships ({data.internships.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'courses' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses ({data.courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            activeTab === 'drives' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Campus Drives ({data.drives.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div>
          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {data.jobs.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No saved jobs yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.jobs.map((job) => (
                    <div key={job.id} className="p-5 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">{job.organization_name}</span>
                          <button onClick={() => handleRemoveBookmark('job', job.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{job.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {job.location} • ₹{(job.salary_min/100000).toFixed(1)} LPA
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                        <Link to="/student/jobs" className="text-xs font-semibold text-indigo-600 hover:underline">
                          View & Apply →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Internships Tab */}
          {activeTab === 'internships' && (
            <div className="space-y-4">
              {data.internships.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No saved internships yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.internships.map((intern) => (
                    <div key={intern.id} className="p-5 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-violet-600 uppercase">{intern.organization_name}</span>
                          <button onClick={() => handleRemoveBookmark('internship', intern.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{intern.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{intern.duration} • {intern.stipend}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                        <Link to="/student/internships" className="text-xs font-semibold text-violet-600 hover:underline">
                          View & Apply →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {data.courses.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No saved courses yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.courses.map((crs) => (
                    <div key={crs.id} className="p-5 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase">{crs.provider}</span>
                          <button onClick={() => handleRemoveBookmark('course', crs.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{crs.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                          <span className="flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {crs.rating}
                          </span>
                          <span>•</span>
                          <span>{crs.duration}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-bold text-emerald-600 uppercase text-[11px]">{crs.price_type}</span>
                        <a href={crs.course_url} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                          Open Course <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Drives Tab */}
          {activeTab === 'drives' && (
            <div className="space-y-4">
              {data.drives.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No saved campus placement drives.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.drives.map((drv) => (
                    <div key={drv.id} className="p-5 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">{drv.organization_name}</span>
                          <button onClick={() => handleRemoveBookmark('drive', drv.id)} className="text-slate-400 hover:text-rose-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{drv.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">Date: {drv.drive_date} • Min CGPA: {drv.min_cgpa}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                        <Link to="/student/drives" className="text-xs font-semibold text-emerald-600 hover:underline">
                          Check Eligibility & Register →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
