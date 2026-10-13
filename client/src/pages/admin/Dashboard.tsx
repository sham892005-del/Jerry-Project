import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  Briefcase,
  GraduationCap,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useNotifications();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/admin/dashboard');
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (id: number, name: string) => {
    setProcessingId(id);
    try {
      await api.patch(`/admin/organizations/${id}/approve`);
      showToast(`Approved "${name}" successfully!`, 'success');
      fetchDashboard();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve organization.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number, name: string) => {
    const reason = window.prompt(`Enter rejection reason for "${name}":`, 'Documentation verification could not be completed.');
    if (reason === null) return;

    setProcessingId(id);
    try {
      await api.patch(`/admin/organizations/${id}/reject`, { reason });
      showToast(`Organization "${name}" rejected.`, 'info');
      fetchDashboard();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject organization.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-semibold text-xs uppercase tracking-wider border border-rose-500/30">
              System Administration
            </span>
          </div>
          <h1 className="text-2xl font-bold">Platform Governance & Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor institutional enrollment, approve corporate partners, moderate opportunities, and oversee platform health.
          </p>
        </div>

        <Link
          to="/admin/demo-data"
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition text-center"
        >
          Demo Data Controls →
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Total Students</span>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalStudents}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active verified learners</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Organizations</span>
            <Building2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalCompanies}</div>
          <div className="text-[11px] text-slate-400 mt-1">Registered partners</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Pending Approvals</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{metrics.pendingCompanies}</div>
          <div className="text-[11px] text-slate-400 mt-1">Require vetting</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Applications</span>
            <Briefcase className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalApplications}</div>
          <div className="text-[11px] text-slate-400 mt-1">Total candidate submissions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Live Jobs</span>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalJobs}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Internships</span>
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalInternships}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Courses</span>
            <BookOpen className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalCourses}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Campus Drives</span>
            <Calendar className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalDrives}</div>
        </div>
      </div>

      {/* Two Columns: Pending Organizations & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Organizations Queue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Pending Organization Registrations
              </h3>
              <Link
                to="/admin/organizations?status=pending"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View All →
              </Link>
            </div>

            {data?.pendingOrgs && data.pendingOrgs.length > 0 ? (
              <div className="space-y-3">
                {data.pendingOrgs.map((org: any) => (
                  <div
                    key={org.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {org.organization_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {org.official_email} • {org.industry || 'Tech'} • {org.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleReject(org.id, org.organization_name)}
                        disabled={processingId === org.id}
                        title="Reject Organization"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleApprove(org.id, org.organization_name)}
                        disabled={processingId === org.id}
                        title="Approve Organization"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-50" />
                All organization registrations have been vetted!
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-right">
            <Link
              to="/admin/organizations"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600"
            >
              Manage Corporate Directory →
            </Link>
          </div>
        </div>

        {/* Platform Audit & Activity Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-indigo-600" />
                Live Platform Notifications & Events
              </h3>
            </div>

            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.slice(0, 5).map((act: any) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{act.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] line-clamp-1">{act.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No recent activity records.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/admin/moderation" className="text-indigo-600 font-semibold hover:underline">
              Moderate Postings
            </Link>
            <Link to="/admin/analytics" className="text-indigo-600 font-semibold hover:underline">
              View Platform Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
