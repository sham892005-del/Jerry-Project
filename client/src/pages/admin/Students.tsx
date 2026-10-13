import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Power,
  GraduationCap,
  Award,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export const AdminStudents: React.FC = () => {
  const { showToast } = useNotifications();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [degree, setDegree] = useState('all');
  const [branch, setBranch] = useState('all');
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (degree !== 'all') params.append('degree', degree);
      if (branch !== 'all') params.append('branch', branch);

      const res = await api.get<{ students: any[] }>(`/admin/students?${params.toString()}`);
      if (res) {
        setStudents(res.students || []);
      }
    } catch (err: any) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [degree, branch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleToggleActive = async (id: number, currentStatus: boolean, name: string) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} ${name}'s account?`)) {
      return;
    }

    setTogglingId(id);
    try {
      const res = await api.patch<any>(`/admin/students/${id}/toggle-active`);
      showToast(res.message || `Student account updated!`, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle student account state.', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-600" />
            Student Account Governance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse registered student profiles, track career readiness, and manage account authorization status.
          </p>
        </div>

        <div className="text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          {students.length} Students Registered
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, college, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Degrees</option>
              <option value="B.Tech">B.Tech</option>
              <option value="M.Tech">M.Tech</option>
              <option value="B.Sc">B.Sc</option>
              <option value="BCA">BCA</option>
            </select>

            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Tech</option>
              <option value="Electronics">ECE</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Students Found</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1">
            Try clearing search filters or seed the database from Demo Data controls.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Degree & Branch</th>
                  <th className="px-6 py-3.5">Academic CGPA</th>
                  <th className="px-6 py-3.5">Profile Completion</th>
                  <th className="px-6 py-3.5">Applications</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{st.full_name}</div>
                      <div className="text-xs text-slate-500">{st.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{st.degree}</div>
                      <div className="text-xs text-slate-500">{st.branch} • Batch {st.graduation_year}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {st.cgpa ? `${st.cgpa} / 10` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${st.completion_percentage || 50}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {st.completion_percentage || 50}%
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {st.application_count || 0} applied
                    </td>
                    <td className="px-6 py-4">
                      {st.is_active ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(st.id, Boolean(st.is_active), st.full_name)}
                        disabled={togglingId === st.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ml-auto ${
                          st.is_active
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        <Power className="h-3 w-3" />
                        {st.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
