import React, { useEffect, useState } from 'react';
import {
  Building2,
  Search,
  Globe,
  MapPin,
  Briefcase,
  CheckCircle2,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Company } from '../../types';

export const Organizations: React.FC = () => {
  const { showToast } = useNotifications();
  const [organizations, setOrganizations] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Express interest modal
  const [selectedOrg, setSelectedOrg] = useState<Company | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      const res = await api.get<{ organizations: Company[] }>(`/student/organizations?${params.toString()}`);
      if (res) {
        setOrganizations(res.organizations || []);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleExpressInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setSending(true);
    try {
      const res = await api.post<{ message: string }>(`/student/organizations/${selectedOrg.id}/express-interest`, {
        message,
      });
      showToast(res.message, 'success');
      setSelectedOrg(null);
      setMessage('');
    } catch (err: any) {
      showToast(err.message || 'Failed to express interest.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Verified Employers</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Partner Organizations Directory
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Browse verified hiring organizations actively participating in our campus recruitment ecosystem.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrgs()}
            placeholder="Search organizations by name or domain..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Orgs Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : organizations.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No organizations found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-indigo-200 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-base shrink-0 border border-indigo-100">
                    {org.organization_name?.charAt(0) || 'O'}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{org.organization_name}</h3>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">{org.industry}</p>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {org.description || 'Enterprise software engineering and technology consulting.'}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <MapPin className="w-3 h-3 text-slate-400" /> {org.location}
                  </span>
                  {org.website && (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-lg border border-slate-100 transition"
                    >
                      <Globe className="w-3 h-3 text-slate-400" /> Website
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium">
                  <span>{(org.active_jobs_count || 0) + (org.active_internships_count || 0)} Open Roles</span>
                </div>

                <button
                  onClick={() => setSelectedOrg(org)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Express Interest
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Express Interest Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  Direct In-Platform Inquiry
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedOrg.organization_name}</h3>
                <p className="text-xs text-slate-500">{selectedOrg.industry} • {selectedOrg.location}</p>
              </div>
              <button
                onClick={() => setSelectedOrg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              This sends a secure internal notification to the talent acquisition team at <strong>{selectedOrg.organization_name}</strong>. Your verified student profile link will be attached.
            </p>

            <form onSubmit={handleExpressInterest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Introduction / Career Interest Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself, mention your degree/branch, and convey which tech stack domains you are passionate about..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrg(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : <><Send className="w-3.5 h-3.5" /> Dispatch Inquiry</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
