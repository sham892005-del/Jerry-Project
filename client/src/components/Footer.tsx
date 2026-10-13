import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">CareerAI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              AI-Assisted Career Guidance & Campus Recruitment System. Final Year Engineering Project.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Demo Build</span>
              <span>•</span>
              <span>Version 1.0.0</span>
            </div>
          </div>

          {/* Col 2: Student Portals */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Student Portal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/auth/student/login" className="hover:text-indigo-600">Student Sign In</Link></li>
              <li><Link to="/auth/student/register" className="hover:text-indigo-600">New Registration</Link></li>
              <li><Link to="/auth/student/login" className="hover:text-indigo-600">AI Career Recommendations</Link></li>
              <li><Link to="/auth/student/login" className="hover:text-indigo-600">Interactive Skill-Gap Tool</Link></li>
              <li><Link to="/auth/student/login" className="hover:text-indigo-600">Personalized Roadmap</Link></li>
            </ul>
          </div>

          {/* Col 3: Recruiter Portals */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Recruiter Portal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/auth/recruiter/login" className="hover:text-indigo-600">Recruiter Sign In</Link></li>
              <li><Link to="/auth/recruiter/register" className="hover:text-indigo-600">Register Organization</Link></li>
              <li><Link to="/auth/recruiter/login" className="hover:text-indigo-600">Post Jobs & Internships</Link></li>
              <li><Link to="/auth/recruiter/login" className="hover:text-indigo-600">Campus Drives Management</Link></li>
              <li><Link to="/auth/recruiter/login" className="hover:text-indigo-600">Candidate Discovery</Link></li>
            </ul>
          </div>

          {/* Col 4: Administrative Governance */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">Governance</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/auth/admin/login" className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-medium">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" /> Admin Portal Login
                </Link>
              </li>
              <li className="text-slate-400">Institutional Governance</li>
              <li className="text-slate-400">Moderation Policies</li>
              <li className="text-slate-400">Security & Candidate Privacy</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 AI-Assisted Career Guidance System. Built for academic demonstration & evaluation.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">Crafted with modern full-stack architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
