import { Router } from 'express';
import {
  getRecruiterDashboard,
  getCompanyProfile,
  updateCompanyProfile,
  getRecruiterJobs,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterInternships,
  createInternship,
  updateInternship,
  deleteInternship,
  getRecruiterCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getRecruiterDrives,
  createDrive,
  updateDrive,
  deleteDrive,
  getCompanyApplications,
  updateApplicationStatus,
  findStudents,
  inviteStudent,
  getRecruiterAnalytics,
} from '../controllers/recruiter.controller';
import { requireAuth, requireRole, requireApprovedCompany } from '../middleware/auth';

const router = Router();

// Protect all recruiter routes
router.use(requireAuth);
router.use(requireRole('recruiter'));

// Recruiter Dashboard & Profile (accessible even if pending, so recruiter sees status)
router.get('/dashboard', getRecruiterDashboard);
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);

// Applications & Visual Pipeline
router.get('/applications', getCompanyApplications);
router.patch('/applications/:id/status', updateApplicationStatus);

// Student Discovery (Respects privacy settings)
router.get('/students', findStudents);
router.post('/students/:studentId/invite', inviteStudent);

// Recruiter Analytics
router.get('/analytics', getRecruiterAnalytics);

// CRUD for Opportunities (Requires company to be APPROVED by admin)
router.get('/jobs', getRecruiterJobs);
router.post('/jobs', requireApprovedCompany, createJob);
router.put('/jobs/:id', requireApprovedCompany, updateJob);
router.delete('/jobs/:id', requireApprovedCompany, deleteJob);

router.get('/internships', getRecruiterInternships);
router.post('/internships', requireApprovedCompany, createInternship);
router.put('/internships/:id', requireApprovedCompany, updateInternship);
router.delete('/internships/:id', requireApprovedCompany, deleteInternship);

router.get('/courses', getRecruiterCourses);
router.post('/courses', requireApprovedCompany, createCourse);
router.put('/courses/:id', requireApprovedCompany, updateCourse);
router.delete('/courses/:id', requireApprovedCompany, deleteCourse);

router.get('/drives', getRecruiterDrives);
router.post('/drives', requireApprovedCompany, createDrive);
router.put('/drives/:id', requireApprovedCompany, updateDrive);
router.delete('/drives/:id', requireApprovedCompany, deleteDrive);

export default router;
