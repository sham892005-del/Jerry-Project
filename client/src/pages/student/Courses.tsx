import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  Star,
  Clock,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Course } from '../../types';

export const Courses: React.FC = () => {
  const { showToast } = useNotifications();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [priceType, setPriceType] = useState('all');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'all') params.append('category', category);
      if (level !== 'all') params.append('level', level);
      if (priceType !== 'all') params.append('priceType', priceType);

      const res = await api.get<{ courses: Course[] }>(`/student/courses?${params.toString()}`);
      if (res) {
        setCourses(res.courses || []);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category, level, priceType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleToggleBookmark = async (courseId: number) => {
    try {
      const res = await api.post<{ bookmarked: boolean; message: string }>('/student/bookmarks/toggle', {
        itemType: 'course',
        itemId: courseId,
      });
      showToast(res.message, 'info');
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, is_bookmarked: res.bookmarked } : c))
      );
    } catch (err: any) {
      showToast('Failed to toggle bookmark.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
          <span>Learning Marketplace</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recommended Upskilling Courses
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Explore curated courses to bridge your skill gaps for high-growth software and data careers.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses or skills..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Data & Analytics">Data & Analytics</option>
            <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Security">Security</option>
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none"
          >
            <option value="all">Pricing</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No courses match your filter criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search query or selecting "All Categories".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    {course.category}
                  </span>
                  <button
                    onClick={() => handleToggleBookmark(course.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition"
                    title={course.is_bookmarked ? 'Remove bookmark' : 'Bookmark course'}
                  >
                    {course.is_bookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{course.title}</h3>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">By {course.provider}</p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Skill tags */}
                {course.skill_tags && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {course.skill_tags.split(',').slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {course.rating}
                  </span>
                  <span>•</span>
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-bold uppercase text-[11px] ${course.price_type === 'free' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {course.price_type === 'free' ? 'Free' : `₹${course.price}`}
                  </span>
                  <a
                    href={course.course_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                    title="Open course URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
