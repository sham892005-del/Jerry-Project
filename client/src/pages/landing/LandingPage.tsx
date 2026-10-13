import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Shield,
  Compass,
  BarChart2,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronDown,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the AI Career Recommendation algorithm work?',
      a: 'Our engine evaluates your academic branch, degree, and CGPA alongside your technical, programming, and soft skill proficiencies. It compares your skill vector against weighted industry career taxonomies to compute a precise percentage match score and highlight specific skill gaps.',
    },
    {
      q: 'What makes the Student and Recruiter portals completely separate?',
      a: 'The system strictly isolates user roles. Students access learning roadmaps, AI career advice, and apply to opportunities. Recruiters access talent search with candidate privacy controls, candidate shortlisting, and a Kanban hiring pipeline. Neither party can access each other’s portal.',
    },
    {
      q: 'Can students protect their private academic information?',
      a: 'Yes. Students have granular privacy settings that dictate whether recruiters can view their CGPA, direct contact email, phone number, and career goals. The backend enforces these privacy preferences directly at the API query level.',
    },
    {
      q: 'How are Campus Recruitment Drives managed?',
      a: 'Partner organizations publish campus recruitment drives with specific eligibility criteria (minimum CGPA, degree, and branch). When students view or apply to a drive, the system performs real-time eligibility verification before permitting registration.',
    },
    {
      q: 'Does the system work without an external AI API key?',
      a: 'Yes! The platform incorporates a robust dual-mode AI architecture. If an external Gemini API key is configured, it enriches responses with generative natural language. If offline or unconfigured, an intelligent deterministic domain engine provides instant, mathematically grounded career recommendations and roadmap guidance.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Background gradient mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-indigo-100/60 via-violet-100/40 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Project Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-8 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Assisted Career Guidance & Recruitment System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Find Your Ideal Career Path with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Intelligent AI Guidance</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Bridge your academic potential with market demand. Discover your top career matches, analyze skill gaps with precision, follow personalized 6-stage roadmaps, and connect with campus recruiters.
          </p>

          {/* Three Portals CTA Matrix */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <Link
              to="/auth/student/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-200 transition group"
            >
              <GraduationCap className="w-5 h-5 text-indigo-200" />
              <span>Enter Student Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              to="/auth/recruiter/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-lg shadow-slate-200 transition group"
            >
              <Briefcase className="w-5 h-5 text-slate-400" />
              <span>Recruiter Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>

            <Link
              to="/auth/admin/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-sm shadow-xs transition"
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Admin Login</span>
            </Link>
          </div>

          {/* Feature Highlights Ticker */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">AI Match Engine</p>
                <p className="text-[11px] text-slate-500">Top 5 tailored paths</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Skill-Gap Analysis</p>
                <p className="text-[11px] text-slate-500">Target readiness score</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">6-Stage Roadmaps</p>
                <p className="text-[11px] text-slate-500">Self-paced checkoffs</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Campus Drives</p>
                <p className="text-[11px] text-slate-500">Real-time eligibility</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Streamlined Journey
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            How The Career Platform Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A seamless three-step pathway designed to elevate engineering students from coursework to dream placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative group hover:border-indigo-200 hover:shadow-md transition">
            <span className="text-3xl font-black text-indigo-100 absolute top-4 right-4">01</span>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Build Your Verified Profile</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Enter your degree, branch, CGPA, technical skills with proficiency ratings, and career goals. Adjust recruiter privacy controls anytime.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative group hover:border-indigo-200 hover:shadow-md transition">
            <span className="text-3xl font-black text-indigo-100 absolute top-4 right-4">02</span>
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Generate AI Career Matches</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Our recommendation engine calculates your Top 5 matched careers, produces natural-language reasoning, and maps your precise skill deficiencies.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm relative group hover:border-indigo-200 hover:shadow-md transition">
            <span className="text-3xl font-black text-indigo-100 absolute top-4 right-4">03</span>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Upskill & Land Placement</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Follow your customized 6-stage roadmap, complete verified courses, apply for campus drives, and track your hiring pipeline in real-time.
            </p>
          </div>
        </div>
      </section>

      {/* AI Guidance Showcase Section */}
      <section id="ai-guidance" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-8 sm:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Intelligent Career Synthesis</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                No Generic Advice. <br />
                <span className="text-indigo-400">Scientifically Weighted</span> Matching.
              </h2>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">
                Most platforms offer simple keyword matching. Our AI service evaluates the weighted interplay of your programming expertise, required career competencies, academic degree relevance, and personal interests to compute actionable match percentages.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Weighted skill overlap calculating exact student proficiency vs target needs.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prioritized missing skills indicating the highest ROI competencies to learn.</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive AI Career Advisor chatbot available 24/7 for interview & resume advice.</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Link
                  to="/auth/student/login"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
                >
                  Explore Recommendations
                </Link>
                <Link
                  to="/auth/student/login"
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition"
                >
                  Chat with AI Advisor
                </Link>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                <div>
                  <span className="text-xs text-indigo-400 font-semibold">Top Career Recommendation</span>
                  <h4 className="text-base font-bold text-white mt-0.5">Full Stack Developer</h4>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold">
                  91% Match
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
                "Alex, your strong proficiency in React, TypeScript, and SQL directly aligns with modern microservice and web engineering. Focus next on Docker and AWS."
              </p>

              <div className="space-y-2">
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Skill-Gap Overview</p>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>React & TypeScript</span>
                      <span className="text-emerald-400 font-bold">85% Proficient</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[85%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>SQL & Relational DBs</span>
                      <span className="text-emerald-400 font-bold">75% Proficient</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[75%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span>Docker Containerization</span>
                      <span className="text-amber-400 font-bold">60% (Priority Gap)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                      <div className="h-full bg-amber-400 w-[60%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter Benefits Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Layers className="w-6 h-6 text-violet-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Visual Pipeline</h4>
              <p className="text-xs text-slate-500 mt-1">Kanban-style movement from Applied to Shortlisted and Selected.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Shield className="w-6 h-6 text-indigo-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Privacy Compliant</h4>
              <p className="text-xs text-slate-500 mt-1">Recruiters view only what candidates explicitly permit.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Calendar className="w-6 h-6 text-emerald-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Campus Drives</h4>
              <p className="text-xs text-slate-500 mt-1">Host structured on-campus hiring with automated CGPA eligibility gating.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <BarChart2 className="w-6 h-6 text-blue-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900">Talent Analytics</h4>
              <p className="text-xs text-slate-500 mt-1">Understand branch and CGPA distributions across candidate pools.</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
              For Organizations & Recruiters
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Discover and Hire Verified Engineering Talent Faster
            </h2>
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              No more sifting through unsorted PDF resumes. Connect directly with students whose verified skill proficiencies align precisely with your tech stack requirements.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link
                to="/auth/recruiter/register"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow transition"
              >
                Register Organization
              </Link>
              <Link
                to="/auth/recruiter/login"
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Recruiter Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-400">14+</p>
              <p className="text-xs text-slate-400 mt-1">Curated Career Trajectories</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-violet-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Automated Eligibility Verification</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">6 Stages</p>
              <p className="text-xs text-slate-400 mt-1">Personalized Learning Roadmap</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-blue-400">3 Portals</p>
              <p className="text-xs text-slate-400 mt-1">Strict Role-Based Separation</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Common Questions & System Design
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                    openFaq === idx ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
