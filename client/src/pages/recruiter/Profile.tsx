import React, { useEffect, useState } from 'react';
import { Building2, Globe, MapPin, Phone, User, Save, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export const RecruiterProfile: React.FC = () => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [organizationName, setOrganizationName] = useState('');
  const [orgType, setOrgType] = useState('Product Company');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [about, setAbout] = useState('');
  const [culture, setCulture] = useState('');
  const [benefits, setBenefits] = useState('');
  const [employeeCount, setEmployeeCount] = useState('50-200');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get<any>('/recruiter/profile');
        if (res?.company) {
          const c = res.company;
          setOrganizationName(c.organization_name || '');
          setOrgType(c.org_type || 'Product Company');
          setIndustry(c.industry || '');
          setWebsite(c.website || '');
          setLocation(c.location || '');
          setDescription(c.description || '');
          setContactPerson(c.contact_person || '');
          setContactPhone(c.contact_phone || '');
          setAbout(c.about || '');
          setCulture(c.culture || '');
          setBenefits(c.benefits || '');
          setEmployeeCount(c.employee_count || '50-200');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/recruiter/profile', {
        organizationName,
        orgType,
        industry,
        website,
        location,
        description,
        contactPerson,
        contactPhone,
        about,
        culture,
        benefits,
        employeeCount,
      });
      showToast('Organization profile saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update company profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Organization Profile</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure how your company details and employer branding appear to student candidates.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Type</label>
            <select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="Product Company">Product Company</option>
              <option value="Enterprise Software">Enterprise Software</option>
              <option value="Early-Stage Startup">Early-Stage Startup</option>
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Focus</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Count</label>
            <select
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            >
              <option value="1-50">1-50 Employees</option>
              <option value="50-200">50-200 Employees</option>
              <option value="250-500">250-500 Employees</option>
              <option value="500+">500+ Employees</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Company Overview & Mission</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering Culture</label>
            <textarea
              rows={3}
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              placeholder="e.g. Open source contributions, bi-weekly hackathons, mentorship pods..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Perks & Candidate Benefits</label>
            <textarea
              rows={3}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="e.g. Health insurance, learning stipends, remote setup allowances..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
