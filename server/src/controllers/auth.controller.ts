import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from '../database/db';
import { signToken } from '../middleware/auth';
import { AuthRequest } from '../types';

export async function registerStudent(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, email, password, confirmPassword, degree, branch, graduationYear } = req.body;

    if (!fullName || !email || !password || !degree || !branch || !graduationYear) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    // Check duplicate email
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const userRes = await execute(
      'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
      [email.toLowerCase().trim(), passwordHash, 'student']
    );
    const userId = userRes.insertId;

    // Insert student record
    const studentRes = await execute(
      'INSERT INTO students (user_id, full_name, degree, branch, graduation_year) VALUES (?, ?, ?, ?, ?)',
      [userId, fullName.trim(), degree.trim(), branch.trim(), Number(graduationYear)]
    );
    const studentId = studentRes.insertId;

    // Insert student profile defaults
    await execute(
      'INSERT INTO student_profiles (student_id, completion_percentage) VALUES (?, 25)',
      [studentId]
    );

    // Insert privacy settings defaults
    await execute(
      'INSERT INTO privacy_settings (student_id, show_cgpa, show_email, show_phone, show_skills, show_interests, show_career_goal, allow_recruiter_messages) VALUES (?, 1, 1, 0, 1, 1, 1, 1)',
      [studentId]
    );

    const token = signToken({ userId, email: email.toLowerCase().trim(), role: 'student' });

    res.status(201).json({
      message: 'Student registration successful!',
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        role: 'student',
        studentId,
        fullName: fullName.trim(),
        degree,
        branch,
        graduationYear: Number(graduationYear),
      }
    });
  } catch (err: any) {
    console.error('Student registration error:', err);
    res.status(500).json({ error: 'Failed to complete registration.', details: err.message });
  }
}

export async function loginStudent(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await queryOne(
      'SELECT id, email, password_hash, role, is_active FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.role !== 'student') {
      res.status(403).json({
        error: `Access Denied: This account is registered as [${user.role.toUpperCase()}]. Please use the dedicated ${user.role} portal.`,
      });
      return;
    }

    if (user.is_active === 0) {
      res.status(403).json({ error: 'Your account has been deactivated by an administrator.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const student = await queryOne(
      'SELECT id, full_name, degree, branch, graduation_year, cgpa, profile_photo FROM students WHERE user_id = ?',
      [user.id]
    );

    const token = signToken({ userId: user.id, email: user.email, role: 'student' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: 'student',
        studentId: student?.id,
        fullName: student?.full_name,
        degree: student?.degree,
        branch: student?.branch,
        graduationYear: student?.graduation_year,
        cgpa: student?.cgpa,
        profilePhoto: student?.profile_photo,
      }
    });
  } catch (err: any) {
    console.error('Student login error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during login.', details: err.message });
  }
}

export async function registerRecruiter(req: Request, res: Response): Promise<void> {
  try {
    const {
      organizationName,
      officialEmail,
      password,
      confirmPassword,
      orgType,
      industry,
      website,
      location,
      description,
      contactPhone,
      contactPerson,
    } = req.body;

    if (!organizationName || !officialEmail || !password || !location) {
      res.status(400).json({ error: 'Organization name, official email, password, and location are required.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [officialEmail.toLowerCase().trim()]);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userRes = await execute(
      'INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, 1)',
      [officialEmail.toLowerCase().trim(), passwordHash, 'recruiter']
    );
    const userId = userRes.insertId;

    // Company is initially 'pending'
    const compRes = await execute(
      `INSERT INTO companies (user_id, organization_name, official_email, org_type, industry, website, location, description, contact_phone, contact_person, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        organizationName.trim(),
        officialEmail.toLowerCase().trim(),
        orgType || 'Product Company',
        industry || 'Information Technology',
        website || '',
        location.trim(),
        description || '',
        contactPhone || '',
        contactPerson || '',
      ]
    );
    const companyId = compRes.insertId;

    await execute(
      'INSERT INTO company_profiles (company_id, about) VALUES (?, ?)',
      [companyId, description || '']
    );

    // Notify administrators of pending registration
    const admins = await queryOne('SELECT id FROM users WHERE role = ?', ['admin']);
    if (admins) {
      await execute(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
        [
          admins.id,
          'New Organization Registration Awaiting Approval',
          `Organization "${organizationName}" has submitted registration credentials.`,
          'admin',
          '/admin/organizations'
        ]
      );
    }

    const token = signToken({ userId, email: officialEmail.toLowerCase().trim(), role: 'recruiter' });

    res.status(201).json({
      message: 'Recruiter registration submitted successfully. Your organization is currently pending administrator verification.',
      token,
      user: {
        id: userId,
        email: officialEmail.toLowerCase().trim(),
        role: 'recruiter',
        companyId,
        organizationName,
        companyStatus: 'pending',
      }
    });
  } catch (err: any) {
    console.error('Recruiter registration error:', err);
    res.status(500).json({ error: 'Failed to register organization.', details: err.message });
  }
}

export async function loginRecruiter(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await queryOne(
      'SELECT id, email, password_hash, role, is_active FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (user.role !== 'recruiter') {
      res.status(403).json({
        error: `Access Denied: This account is registered as [${user.role.toUpperCase()}]. Please use the dedicated ${user.role} portal.`,
      });
      return;
    }

    if (user.is_active === 0) {
      res.status(403).json({ error: 'Your recruiter account has been suspended by an administrator.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const company = await queryOne(
      'SELECT id, organization_name, status, rejection_reason, website, location FROM companies WHERE user_id = ?',
      [user.id]
    );

    const token = signToken({ userId: user.id, email: user.email, role: 'recruiter' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: 'recruiter',
        companyId: company?.id,
        organizationName: company?.organization_name,
        companyStatus: company?.status || 'pending',
        rejectionReason: company?.rejection_reason,
        website: company?.website,
        location: company?.location,
      }
    });
  } catch (err: any) {
    console.error('Recruiter login error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during login.', details: err.message });
  }
}

export async function loginAdmin(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await queryOne(
      'SELECT id, email, password_hash, role, is_active FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (!user) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Access Denied: Administrative privileges required.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: 'admin' });

    res.json({
      message: 'Admin authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: 'admin',
        fullName: 'System Administrator',
      }
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'An unexpected error occurred during admin authentication.', details: err.message });
  }
}

export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthenticated.' });
      return;
    }

    const user = await queryOne('SELECT id, email, role, is_active, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    let extra: Record<string, any> = {};

    if (user.role === 'student') {
      const student = await queryOne(
        `SELECT s.*, p.bio, p.career_goal, p.preferred_job_role, p.preferred_industry, p.preferred_location, p.completion_percentage
         FROM students s
         LEFT JOIN student_profiles p ON p.student_id = s.id
         WHERE s.user_id = ?`,
        [user.id]
      );
      extra = { student };
    } else if (user.role === 'recruiter') {
      const company = await queryOne(
        `SELECT c.*, cp.logo_url, cp.banner_url, cp.about, cp.culture, cp.benefits, cp.employee_count
         FROM companies c
         LEFT JOIN company_profiles cp ON cp.company_id = c.id
         WHERE c.user_id = ?`,
        [user.id]
      );
      extra = { company };
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: Boolean(user.is_active),
        createdAt: user.created_at,
        ...extra,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve current user session.', details: err.message });
  }
}
