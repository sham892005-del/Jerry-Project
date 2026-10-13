import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, Shield, Briefcase, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'student') return '/student/dashboard';
    if (user.role === 'recruiter') return user.companyStatus === 'pending' ? '/recruiter/pending' : '/recruiter/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              CareerAI <span className="text-[10px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">v1.0</span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">AI Career Guidance System</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-indigo-600 transition">How it Works</a>
          <a href="#features" className="hover:text-indigo-600 transition">Features</a>
          <a href="#ai-guidance" className="hover:text-indigo-600 transition">AI Guidance</a>
          <a href="#opportunities" className="hover:text-indigo-600 transition">Opportunities</a>
          <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
        </nav>

        {/* Portal Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardLink()}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white shadow hover:bg-indigo-700 transition"
              >
                Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/auth/student/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
              >
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                Student Portal
              </Link>
              <Link
                to="/auth/recruiter/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition"
              >
                <Briefcase className="w-4 h-4 text-slate-500" />
                Recruiter Portal
              </Link>
              <Link
                to="/auth/admin/login"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Admin Portal"
              >
                <Shield className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3">
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            How it Works
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            Features
          </a>
          <a
            href="#ai-guidance"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            AI Guidance
          </a>
          <a
            href="#opportunities"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            Opportunities
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 py-1"
          >
            FAQ
          </a>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/auth/student/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white"
                >
                  <GraduationCap className="w-4 h-4" /> Student Portal Login
                </Link>
                <Link
                  to="/auth/recruiter/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold bg-slate-800 text-white"
                >
                  <Briefcase className="w-4 h-4" /> Recruiter Portal Login
                </Link>
                <Link
                  to="/auth/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Access
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
