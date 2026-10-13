import React, { useEffect, useState } from 'react';
import {
  User,
  GraduationCap,
  Wrench,
  Heart,
  Target,
  Shield,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export const StudentProfile: React.FC = () => {
  const { showToast } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'skills' | 'career' | 'privacy'>('personal');

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [degree, setDegree] = useState('');
  const [branch, setBranch] = useState('');
  const [college, setCollege] = useState('');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [cgpa, setCgpa] = useState('0.00');
  const [bio, setBio] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [preferredJobRole, setPreferredJobRole] = useState('');
  const [preferredIndustry, setPreferredIndustry] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(25);

  // Skills
  const [skills, setSkills] = useState<Array<{ name: string; proficiency: number; type: string }>>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(70);
  const [newSkillType, setNewSkillType] = useState('programming');

  // Interests
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    show_cgpa: true,
    show_email: true,
    show_phone: false,
    show_skills: true,
    show_interests: true,
    show_career_goal: true,
    allow_recruiter_messages: true,
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get<any>('/student/profile');
      if (res) {
        const s = res.student || {};
        setFullName(s.full_name || '');
        setEmail(s.email || '');
        setPhone(s.phone || '');
        setDegree(s.degree || 'B.Tech');
        setBranch(s.branch || '');
        setCollege(s.college || 'National Institute of Technology');
        setGraduationYear(String(s.graduation_year || 2025));
        setCgpa(String(s.cgpa || '8.5'));
        setBio(s.bio || '');
        setCareerGoal(s.career_goal || '');
        setPreferredJobRole(s.preferred_job_role || '');
        setPreferredIndustry(s.preferred_industry || '');
        setPreferredLocation(s.preferred_location || '');
        setCompletionPercentage(s.completion_percentage || 50);

        setSkills(
          res.skills?.map((sk: any) => ({
            name: sk.name,
            proficiency: sk.proficiency_level || 70,
            type: sk.type || sk.category || 'technical',
          })) || []
        );

        setInterests(res.interests || []);

        if (res.privacy) {
          setPrivacy({
            show_cgpa: Boolean(res.privacy.show_cgpa),
            show_email: Boolean(res.privacy.show_email),
            show_phone: Boolean(res.privacy.show_phone),
            show_skills: Boolean(res.privacy.show_skills),
            show_interests: Boolean(res.privacy.show_interests),
            show_career_goal: Boolean(res.privacy.show_career_goal),
            allow_recruiter_messages: Boolean(res.privacy.allow_recruiter_messages),
          });
        }
      }
    } catch (err: any) {
      showToast('Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/student/profile', {
        fullName,
        degree,
        branch,
        college,
        graduationYear: Number(graduationYear),
        cgpa: Number(cgpa),
        phone,
        bio,
        careerGoal,
        preferredJobRole,
        preferredIndustry,
        preferredLocation,
      });

      await api.put('/student/profile/skills', { skills });
      await api.put('/student/profile/interests', { interests });
      await api.put('/student/profile/privacy', privacy);

      showToast('Student profile and privacy settings saved successfully!', 'success');
      await fetchProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      showToast('Skill already exists in your list.', 'warning');
      return;
    }
    setSkills([...skills, { name: newSkillName.trim(), proficiency: newSkillLevel, type: newSkillType }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (name: string) => {
    setSkills(skills.filter((s) => s.name !== name));
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    if (interests.includes(newInterest.trim())) return;
    setInterests([...interests, newInterest.trim()]);
    setNewInterest('');
  };

  const handleRemoveInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Profile & Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep your academic data and competencies updated to maximize AI recommendation accuracy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <span>Completion:</span>
            <span className="font-extrabold">{completionPercentage}%</span>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Info</span>
        </button>

        <button
          onClick={() => setActiveTab('education')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'education'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Education</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'skills'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Skills & Proficiency ({skills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('career')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'career'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Career Goals & Interests</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Recruiter Privacy Controls</span>
        </button>
      </div>

      {/* Tab 1: Personal Info */}
      {activeTab === 'personal' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Registered)</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Work Location</label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g. Bangalore / Remote"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Bio / Professional Summary</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Highlight your academic focus, notable hackathon builds, and engineering passions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Education */}
      {activeTab === 'education' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Academic Credentials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Institution / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="M.C.A.">M.C.A.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="B.Sc">B.Sc Computer Science</option>
                <option value="B.C.A.">B.C.A.</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cumulative Grade Point Average (CGPA / 10.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Used for automated eligibility verification in Campus Drives.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Skills & Proficiency */}
      {activeTab === 'skills' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Skill Competency Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your verified proficiency level (1% - 100%) for each skill. The AI recommendation engine evaluates these directly.
            </p>
          </div>

          {/* Add Skill Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. Docker, Python, Go)"
              className="w-full sm:flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <select
              value={newSkillType}
              onChange={(e) => setNewSkillType(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
            >
              <option value="programming">Programming</option>
              <option value="technical">Technical / Framework</option>
              <option value="tool">Tool / DevOps</option>
              <option value="soft">Soft Skill</option>
            </select>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{newSkillLevel}%</span>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                className="w-28 accent-indigo-600"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSkill}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1 shrink-0 transition"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{s.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600">
                      {s.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveSkill(s.name)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                    title="Remove Skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={s.proficiency}
                    onChange={(e) => {
                      const updated = [...skills];
                      updated[idx].proficiency = Number(e.target.value);
                      setSkills(updated);
                    }}
                    className="w-full accent-indigo-600 h-1.5"
                  />
                  <span className="text-xs font-bold text-indigo-700 w-10 text-right">{s.proficiency}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Career Goals & Interests */}
      {activeTab === 'career' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-800">Career Trajectory & Target Ambitions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Career Goal Statement</label>
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Lead Full Stack Architect at an enterprise tech firm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Job Role</label>
              <input
                type="text"
                value={preferredJobRole}
                onChange={(e) => setPreferredJobRole(e.target.value)}
                placeholder="e.g. Full Stack Developer / Software Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Industry</label>
              <input
                type="text"
                value={preferredIndustry}
                onChange={(e) => setPreferredIndustry(e.target.value)}
                placeholder="e.g. Cloud Computing & FinTech"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Interests Tag Cloud */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Areas of Interest / Tech Domains</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {interests.map((it, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium"
                >
                  <span>{it}</span>
                  <button onClick={() => handleRemoveInterest(it)} className="hover:text-rose-600">
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="e.g. Distributed Systems, Neural Networks"
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Privacy Settings */}
      {activeTab === 'privacy' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Candidate Information Privacy Controls</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Choose exactly what recruiter organizations are permitted to see when discovering candidates. The backend enforces these settings directly.
            </p>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Show Cumulative GPA (CGPA) to Recruiters</p>
                <p className="text-[11px] text-slate-500">When disabled, your CGPA displays as "[Hidden by Candidate]" to companies.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.show_cgpa}
                onChange={(e) => setPrivacy({ ...privacy, show_cgpa: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Show Email Address in Public Candidate Search</p>
                <p className="text-[11px] text-slate-500">Prevent recruiters from viewing your raw email before formal contact.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.show_email}
                onChange={(e) => setPrivacy({ ...privacy, show_email: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Show Phone Number to Recruiters</p>
                <p className="text-[11px] text-slate-500">Only permit platform message notifications unless checked.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.show_phone}
                onChange={(e) => setPrivacy({ ...privacy, show_phone: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Show Skills & Proficiency Levels</p>
                <p className="text-[11px] text-slate-500">Allow recruiters to evaluate your skill badges in candidate search.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.show_skills}
                onChange={(e) => setPrivacy({ ...privacy, show_skills: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between pt-3 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-slate-800">Allow Direct Recruiter Inquiries & Invitations</p>
                <p className="text-[11px] text-slate-500">Receive in-platform notifications when recruiters express interest in your profile.</p>
              </div>
              <input
                type="checkbox"
                checked={privacy.allow_recruiter_messages}
                onChange={(e) => setPrivacy({ ...privacy, allow_recruiter_messages: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
