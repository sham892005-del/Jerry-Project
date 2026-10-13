import { Router } from 'express';
import {
  getAdminDashboard,
  getAdminStudents,
  toggleStudentActive,
  getAdminOrganizations,
  approveOrganization,
  rejectOrganization,
  getModerationItems,
  moderateContent,
  getAdminAnalytics,
  resetDemoData,
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Strict Admin-only protection
router.use(requireAuth);
router.use(requireRole('admin'));

// Dashboard & Analytics
router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);

// Student Governance
router.get('/students', getAdminStudents);
router.patch('/students/:id/toggle-active', toggleStudentActive);

// Organization Approvals & Governance
router.get('/organizations', getAdminOrganizations);
router.patch('/organizations/:id/approve', approveOrganization);
router.patch('/organizations/:id/reject', rejectOrganization);

// Content Moderation
router.get('/moderation', getModerationItems);
router.post('/moderation/action', moderateContent);

// Demo Data Management
router.post('/demo-data/seed', resetDemoData);

export default router;
