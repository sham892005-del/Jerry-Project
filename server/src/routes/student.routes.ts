import { Router } from 'express';
import {
  getStudentDashboard,
  getStudentProfile,
  updateStudentProfile,
  updateStudentSkills,
  updateStudentInterests,
  updatePrivacySettings,
  getRecommendations,
  getSkillGap,
  getRoadmap,
  toggleRoadmapItem,
  getCourses,
  getJobs,
  getInternships,
  getRecruitmentDrives,
  applyToOpportunity,
  getStudentApplications,
  toggleBookmark,
  getBookmarks,
  getOrganizations,
  expressInterestInOrg,
  getChatSessions,
  getChatMessages,
  sendChatMessage,
  getNotifications,
  markNotificationRead,
} from '../controllers/student.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// Protect all student routes
router.use(requireAuth);
router.use(requireRole('student'));

// Dashboard & Profile
router.get('/dashboard', getStudentDashboard);
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.put('/profile/skills', updateStudentSkills);
router.put('/profile/interests', updateStudentInterests);
router.put('/profile/privacy', updatePrivacySettings);

// AI Recommendations & Skill Gap
router.get('/recommendations', getRecommendations);
router.get('/skill-gap/:careerId', getSkillGap);

// Personalized Learning Roadmap
router.get('/roadmap', getRoadmap);
router.patch('/roadmap/stage/:itemId', toggleRoadmapItem);

// Opportunities Discovery
router.get('/courses', getCourses);
router.get('/jobs', getJobs);
router.get('/internships', getInternships);
router.get('/drives', getRecruitmentDrives);

// Applications
router.post('/apply', applyToOpportunity);
router.get('/applications', getStudentApplications);

// Bookmarks / Saved
router.post('/bookmarks/toggle', toggleBookmark);
router.get('/bookmarks', getBookmarks);

// Organizations Directory & Express Interest
router.get('/organizations', getOrganizations);
router.post('/organizations/:companyId/express-interest', expressInterestInOrg);

// AI Career Advisor Chatbot
router.get('/chat/sessions', getChatSessions);
router.get('/chat/messages/:sessionId', getChatMessages);
router.post('/chat/message', sendChatMessage);

// In-App Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
