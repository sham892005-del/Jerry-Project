import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Clock,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useSearchParams } from 'react-router-dom';

export const AdminOrganizations: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const { showToast } = useNotifications();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get<{ organizations: any[] }>(`/admin/organizations?${params.toString()}`);
      if (res) {
        setOrganizations(res.organizations || []);
      }
    } catch (err: any) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrganizations();
  };

  const handleApprove = async (id: number, name: string) => {
    setProcessingId(id);
    try {
      await api.patch(`/admin/organizations/${id}/approve`);
      showToast(`Organization "${name}" approved!`, 'success');
      fetchOrganizations();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve organization.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number, name: string) => {
    const reason = window.prompt(`Enter rejection reason for "${name}":`, 'Corporate registration documents unverified.');
    if (reason === null) return;

    setProcessingId(id);
    try {
      await api.patch(`/admin/organizations/${id}/reject`, { reason });
      showToast(`Organization "${name}" rejected.`, 'info');
      fetchOrganizations();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject organization.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle className="h-3 w-3" /> Approved Partner
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
            <AlertTriangle className="h-3 w-3" /> Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-indigo-600" />
            Corporate & Recruiter Verification
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review employer registrations, approve verified organizations, and manage institutional hiring privileges.
          </p>
        </div>

        <div className="text-sm font-semibold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          {organizations.length} Organizations Total
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company name, email, or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
      ) : organizations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Organizations Found</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1">
            No corporate entities match the current status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Organization</th>
                  <th className="px-6 py-3.5">Industry & HQ</th>
                  <th className="px-6 py-3.5">Registered Email</th>
                  <th className="px-6 py-3.5">Active Postings</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-base">{org.organization_name}</div>
                      {org.website && (
                        <a
                          href={org.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {org.website} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{org.industry || 'Technology'}</div>
                      <div className="text-xs text-slate-500">{org.location || 'India'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      {org.official_email}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div>{org.job_count || 0} jobs</div>
                      <div className="text-xs text-slate-500">{org.drive_count || 0} drives</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(org.status)}
                      {org.status === 'rejected' && org.rejection_reason && (
                        <div className="text-[11px] text-rose-500 italic mt-1">
                          "{org.rejection_reason}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {org.status !== 'approved' && (
                          <button
                            onClick={() => handleApprove(org.id, org.organization_name)}
                            disabled={processingId === org.id}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </button>
                        )}

                        {org.status !== 'rejected' && (
                          <button
                            onClick={() => handleReject(org.id, org.organization_name)}
                            disabled={processingId === org.id}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
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
