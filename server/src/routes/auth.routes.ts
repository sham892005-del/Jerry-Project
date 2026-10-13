import { Router } from 'express';
import {
  registerStudent,
  loginStudent,
  registerRecruiter,
  loginRecruiter,
  loginAdmin,
  getCurrentUser
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Student Authentication
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);

// Recruiter Authentication
router.post('/recruiter/register', registerRecruiter);
router.post('/recruiter/login', loginRecruiter);

// Admin Authentication (No public registration)
router.post('/admin/login', loginAdmin);

// Current User Session
router.get('/me', requireAuth, getCurrentUser);

export default router;
