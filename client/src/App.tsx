import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { RecruiterLayout } from './layouts/RecruiterLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Role Route Guards
import { StudentRoute, RecruiterRoute, AdminRoute } from './components/routes/RoleRoutes';

// Landing & Error Pages
import { LandingPage } from './pages/landing/LandingPage';
import { NotFound } from './pages/errors/NotFound';
import { Unauthorized } from './pages/errors/Unauthorized';

// Auth Pages
import { StudentLogin } from './pages/auth/StudentLogin';
import { StudentRegister } from './pages/auth/StudentRegister';
import { RecruiterLogin } from './pages/auth/RecruiterLogin';
import { RecruiterRegister } from './pages/auth/RecruiterRegister';
import { AdminLogin } from './pages/auth/AdminLogin';

// Student Portal Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentProfile } from './pages/student/Profile';
import { Recommendations } from './pages/student/Recommendations';
import { SkillGap } from './pages/student/SkillGap';
import { Roadmap } from './pages/student/Roadmap';
import { Courses } from './pages/student/Courses';
import { Jobs } from './pages/student/Jobs';
import { Internships } from './pages/student/Internships';
import { Drives } from './pages/student/Drives';
import { Applications } from './pages/student/Applications';
import { SavedItems } from './pages/student/SavedItems';
import { Organizations } from './pages/student/Organizations';
import { Advisor } from './pages/student/Advisor';

// Recruiter Portal Pages
import { RecruiterPending } from './pages/recruiter/Pending';
import { RecruiterDashboard } from './pages/recruiter/Dashboard';
import { RecruiterProfile } from './pages/recruiter/Profile';
import { RecruiterJobs } from './pages/recruiter/Jobs';
import { RecruiterInternships } from './pages/recruiter/Internships';
import { RecruiterCourses } from './pages/recruiter/Courses';
import { RecruiterDrives } from './pages/recruiter/Drives';
import { RecruiterApplications } from './pages/recruiter/Applications';
import { RecruiterPipeline } from './pages/recruiter/Pipeline';
import { RecruiterStudents } from './pages/recruiter/Students';
import { RecruiterAnalytics } from './pages/recruiter/Analytics';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminStudents } from './pages/admin/Students';
import { AdminOrganizations } from './pages/admin/Organizations';
import { AdminModeration } from './pages/admin/Moderation';
import { AdminAnalytics } from './pages/admin/Analytics';
import { AdminDemoData } from './pages/admin/DemoData';

// UI
import { ToastContainer } from './components/ui/ToastContainer';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public & Landing */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/student/login" element={<StudentLogin />} />
          <Route path="/auth/student/register" element={<StudentRegister />} />
          <Route path="/auth/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/auth/recruiter/register" element={<RecruiterRegister />} />
          <Route path="/auth/admin/login" element={<AdminLogin />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Route>

        {/* Student Portal (Protected by StudentRoute) */}
        <Route element={<StudentRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/recommendations" element={<Recommendations />} />
            <Route path="/student/skill-gap" element={<SkillGap />} />
            <Route path="/student/roadmap" element={<Roadmap />} />
            <Route path="/student/courses" element={<Courses />} />
            <Route path="/student/jobs" element={<Jobs />} />
            <Route path="/student/internships" element={<Internships />} />
            <Route path="/student/drives" element={<Drives />} />
            <Route path="/student/applications" element={<Applications />} />
            <Route path="/student/saved" element={<SavedItems />} />
            <Route path="/student/organizations" element={<Organizations />} />
            <Route path="/student/advisor" element={<Advisor />} />
          </Route>
        </Route>

        {/* Recruiter Portal (Protected by RecruiterRoute) */}
        <Route element={<RecruiterRoute />}>
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
            <Route path="/recruiter/pending" element={<RecruiterPending />} />
            <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
            <Route path="/recruiter/profile" element={<RecruiterProfile />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/internships" element={<RecruiterInternships />} />
            <Route path="/recruiter/courses" element={<RecruiterCourses />} />
            <Route path="/recruiter/drives" element={<RecruiterDrives />} />
            <Route path="/recruiter/applications" element={<RecruiterApplications />} />
            <Route path="/recruiter/pipeline" element={<RecruiterPipeline />} />
            <Route path="/recruiter/students" element={<RecruiterStudents />} />
            <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
          </Route>
        </Route>

        {/* Admin Portal (Protected by AdminRoute) */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/organizations" element={<AdminOrganizations />} />
            <Route path="/admin/moderation" element={<AdminModeration />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/demo-data" element={<AdminDemoData />} />
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
