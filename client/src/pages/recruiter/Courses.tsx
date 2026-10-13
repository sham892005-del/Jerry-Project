import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Tag,
  Clock,
  DollarSign,
  X,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const RecruiterCourses: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState(user?.organizationName || 'Industry Training Lab');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Full Stack Web Development');
  const [skillTags, setSkillTags] = useState('React, Node.js, PostgreSQL');
  const [level, setLevel] = useState('intermediate');
  const [duration, setDuration] = useState('8 Weeks');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState('0');
  const [courseUrl, setCourseUrl] = useState('https://coursera.org');

  const isPending = user?.companyStatus === 'pending';

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ courses: any[] }>('/recruiter/courses');
      if (res) {
        setCourses(res.courses || []);
      }
    } catch (err) {
      console.error('Failed to load recruiter courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setProvider(user?.organizationName || 'Industry Training Lab');
    setDescription('');
    setCategory('Full Stack Web Development');
    setSkillTags('React, Node.js, SQL');
    setLevel('intermediate');
    setDuration('8 Weeks');
    setPriceType('free');
    setPrice('0');
    setCourseUrl('https://example.com');
    setModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setTitle(item.title);
    setProvider(item.provider);
    setDescription(item.description);
    setCategory(item.category);
    setSkillTags(item.skill_tags || '');
    setLevel(item.level || 'intermediate');
    setDuration(item.duration || '6 Weeks');
    setPriceType(item.price_type || 'free');
    setPrice(String(item.price || 0));
    setCourseUrl(item.course_url || 'https://example.com');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) {
      showToast('Please fill all required fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        provider,
        description,
        category,
        skillTags,
        level,
        duration,
        priceType,
        price: Number(price) || 0,
        courseUrl,
      };

      if (editingItem) {
        await api.put(`/recruiter/courses/${editingItem.id}`, payload);
        showToast('Course curriculum updated successfully!', 'success');
      } else {
        await api.post('/recruiter/courses', payload);
        showToast('Course published to student directory!', 'success');
      }

      setModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || 'Failed to save course.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, itemTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete course "${itemTitle}"?`)) {
      return;
    }
    try {
      await api.delete(`/recruiter/courses/${id}`);
      showToast('Course removed from directory.', 'success');
      fetchCourses();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete course.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-indigo-600" />
            Curated Courses & Learning Modules
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Recommend sponsored learning materials and training tracks directly to interested students.
          </p>
        </div>

        {isPending ? (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl text-sm font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Publishing disabled while organization is pending
          </div>
        ) : (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium shadow-md shadow-indigo-100 hover:bg-indigo-700 transition"
          >
            <Plus className="h-5 w-5" />
            Publish New Course
          </button>
        )}
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Courses Published</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1 mb-6">
            Help bridge student skill gaps by recommending industry courses, certifications, and technical tracks.
          </p>
          {!isPending && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              Publish First Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">{item.title}</h3>
                    <p className="text-xs font-medium text-slate-500">{item.provider}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit Course"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      title="Delete Course"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-600 text-sm line-clamp-3 mb-4">{item.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                    <span className="capitalize">{item.level} Level</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{item.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      {item.price_type === 'free' ? 'Free Course' : `₹${item.price}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5 text-indigo-500" />
                    <a
                      href={item.course_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline truncate"
                    >
                      Source Link
                    </a>
                  </div>
                </div>

                {item.skill_tags && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.skill_tags.split(',').map((s: string, idx: number) => (
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
                <span className="text-xs text-slate-400">Status: Active in Student Portal</span>
                <a
                  href={item.course_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  Visit Course <ExternalLink className="h-3 w-3" />
                </a>
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
                {editingItem ? 'Edit Course Listing' : 'Publish New Course'}
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
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Modern Full-Stack Cloud Architecture"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Provider / Platform
                  </label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g. TechNova Learning Lab, Coursera"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Data & Artificial Intelligence">Data & Artificial Intelligence</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Product & Design">Product & Design</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 Weeks (Self-paced)"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Pricing
                  </label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="free">Free / Sponsored</option>
                    <option value="paid">Paid Certification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={priceType === 'free'}
                    placeholder="0"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Skills Taught (Comma separated)
                </label>
                <input
                  type="text"
                  value={skillTags}
                  onChange={(e) => setSkillTags(e.target.value)}
                  placeholder="e.g. React, Node.js, Docker, Kubernetes"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Course External URL
                </label>
                <input
                  type="url"
                  value={courseUrl}
                  onChange={(e) => setCourseUrl(e.target.value)}
                  placeholder="https://learn.company.com/track"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Course Syllabus & Learning Outcomes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the modules, hands-on capstones, and industry credentials..."
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
                  {saving ? 'Saving...' : editingItem ? 'Update Course' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
