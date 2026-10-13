import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  GraduationCap,
  Award,
  Send,
  Eye,
  Lock,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  X,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';

export const RecruiterStudents: React.FC = () => {
  const { showToast } = useNotifications();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [degree, setDegree] = useState('all');
  const [branch, setBranch] = useState('all');
  const [minCgpa, setMinCgpa] = useState('');
  const [skill, setSkill] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const [opportunityTitle, setOpportunityTitle] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  // Candidate Details Modal
  const [viewStudent, setViewStudent] = useState<any | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (degree !== 'all') params.append('degree', degree);
      if (branch !== 'all') params.append('branch', branch);
      if (minCgpa) params.append('minCgpa', minCgpa);
      if (skill) params.append('skill', skill);

      const res = await api.get<{ students: any[] }>(`/recruiter/students?${params.toString()}`);
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
  }, [degree, branch, minCgpa, skill]);

  const openInviteModal = (student: any) => {
    setSelectedStudent(student);
    setOpportunityTitle('Engineering / Analyst Roles');
    setInviteMessage(`Hi ${student.fullName}, we were impressed by your background and academic trajectory. We invite you to review our active positions and submit your application!`);
    setInviteModalOpen(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setSendingInvite(true);
    try {
      await api.post(`/recruiter/students/${selectedStudent.id}/invite`, {
        message: inviteMessage,
        opportunityTitle,
      });

      showToast(`Invitation sent directly to ${selectedStudent.fullName}!`, 'success');
      setInviteModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to send invitation.', 'error');
    } finally {
      setSendingInvite(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(term) ||
      s.branch?.toLowerCase().includes(term) ||
      s.degree?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-indigo-600" />
            Discover Student Talent
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Search verified student profiles with student privacy controls strictly enforced on the server.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <span className="font-semibold text-slate-900">{filteredStudents.length}</span> Candidates Available
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
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
              <option value="Data Science">Data Science</option>
            </select>

            <input
              type="number"
              step="0.1"
              placeholder="Min CGPA (e.g. 8.0)"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <input
              type="text"
              placeholder="Skill (e.g. Python)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <UserCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Candidates Match Filters</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm mt-1">
            Try adjusting your CGPA, degree, or skill search parameters to broaden the candidate pool.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-base border border-indigo-100">
                      {student.fullName?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {student.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {student.college || 'Engineering Institute'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Program:</span>
                    <span className="font-semibold text-slate-800">
                      {student.degree} ({student.branch})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Batch:</span>
                    <span className="font-medium text-slate-800">Class of {student.graduationYear}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Academic Standing:</span>
                    {student.cgpaHidden ? (
                      <span className="flex items-center gap-1 text-slate-400 italic">
                        <Lock className="h-3 w-3" /> Hidden by candidate
                      </span>
                    ) : (
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {student.cgpa} CGPA
                      </span>
                    )}
                  </div>
                </div>

                {student.careerGoal && (
                  <div className="text-xs text-slate-600 mb-3 bg-amber-50/60 border border-amber-100 p-2.5 rounded-lg">
                    <span className="font-semibold text-amber-800">Career Goal:</span> {student.careerGoal}
                  </div>
                )}

                {/* Skills tags */}
                {student.skills && student.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {student.skills.slice(0, 5).map((sk: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {sk.name}
                      </span>
                    ))}
                    {student.skills.length > 5 && (
                      <span className="text-[11px] font-medium bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded">
                        +{student.skills.length - 5} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic mb-4">
                    Skills marked private or not specified.
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setViewStudent(student)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View Profile
                </button>

                <button
                  onClick={() => openInviteModal(student)}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
                >
                  <Send className="h-3 w-3" />
                  Invite to Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Invite Candidate</h2>
                <p className="text-xs text-slate-500">{selectedStudent.fullName} • {selectedStudent.degree}</p>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Opportunity / Role
                </label>
                <input
                  type="text"
                  required
                  value={opportunityTitle}
                  onChange={(e) => setOpportunityTitle(e.target.value)}
                  placeholder="e.g. Software Engineer Graduate Program"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Personal Invitation Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                  {sendingInvite ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-lg">
                  {viewStudent.fullName?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{viewStudent.fullName}</h2>
                  <p className="text-xs text-slate-500">{viewStudent.college}</p>
                </div>
              </div>
              <button
                onClick={() => setViewStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-slate-400 block">Degree & Branch</span>
                  <span className="font-semibold text-slate-800">{viewStudent.degree} • {viewStudent.branch}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Graduation Batch</span>
                  <span className="font-semibold text-slate-800">Class of {viewStudent.graduationYear}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">CGPA</span>
                  {viewStudent.cgpaHidden ? (
                    <span className="text-slate-400 italic text-xs flex items-center gap-1"><Lock className="h-3 w-3" /> Private</span>
                  ) : (
                    <span className="font-bold text-indigo-700">{viewStudent.cgpa} / 10.0</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Email Address</span>
                  {viewStudent.email ? (
                    <span className="font-medium text-slate-800">{viewStudent.email}</span>
                  ) : (
                    <span className="text-slate-400 italic text-xs flex items-center gap-1"><Lock className="h-3 w-3" /> Hidden by candidate</span>
                  )}
                </div>
              </div>

              {viewStudent.bio && (
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">Candidate Bio</h4>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-xl text-xs">{viewStudent.bio}</p>
                </div>
              )}

              {viewStudent.skills && viewStudent.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2">Technical & Domain Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewStudent.skills.map((sk: any, idx: number) => (
                      <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {sk.name} ({sk.proficiency_level}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setViewStudent(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewStudent(null);
                  openInviteModal(viewStudent);
                }}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
              >
                <Send className="h-4 w-4" />
                Invite Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
