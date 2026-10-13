import { Response } from 'express';
import { AuthRequest } from '../types';
import { query, queryOne, execute } from '../database/db';
import { seedDatabase } from '../database/seed';

// --- Admin Dashboard Overview ---

export async function getAdminDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentsCount = await queryOne('SELECT COUNT(*) as count FROM students');
    const companiesCount = await queryOne('SELECT COUNT(*) as count FROM companies');
    const pendingCompaniesCount = await queryOne("SELECT COUNT(*) as count FROM companies WHERE status = 'pending'");
    const jobsCount = await queryOne('SELECT COUNT(*) as count FROM jobs');
    const internshipsCount = await queryOne('SELECT COUNT(*) as count FROM internships');
    const coursesCount = await queryOne('SELECT COUNT(*) as count FROM courses');
    const drivesCount = await queryOne('SELECT COUNT(*) as count FROM recruitment_drives');
    const applicationsCount = await queryOne('SELECT COUNT(*) as count FROM applications');

    // Recent activity logs / notifications
    const recentActivity = await query(
      `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 8`
    );

    // Recent pending companies
    const pendingOrgs = await query(
      `SELECT id, organization_name, official_email, org_type, industry, location, created_at
       FROM companies WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      metrics: {
        totalStudents: Number(studentsCount?.count || 0),
        totalCompanies: Number(companiesCount?.count || 0),
        pendingCompanies: Number(pendingCompaniesCount?.count || 0),
        totalJobs: Number(jobsCount?.count || 0),
        totalInternships: Number(internshipsCount?.count || 0),
        totalCourses: Number(coursesCount?.count || 0),
        totalDrives: Number(drivesCount?.count || 0),
        totalApplications: Number(applicationsCount?.count || 0),
      },
      pendingOrgs,
      recentActivity,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load admin dashboard.', details: err.message });
  }
}

// --- Student Management ---

export async function getAdminStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, degree, branch } = req.query;
    let sql = `
      SELECT s.*, u.email, u.is_active, p.career_goal, p.completion_percentage,
             (SELECT COUNT(*) FROM applications WHERE student_id = s.id) as application_count
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN student_profiles p ON p.student_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (s.full_name LIKE ? OR u.email LIKE ? OR s.college LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (degree && degree !== 'all') {
      sql += ` AND s.degree = ?`;
      params.push(degree);
    }
    if (branch && branch !== 'all') {
      sql += ` AND s.branch LIKE ?`;
      params.push(`%${branch}%`);
    }

    sql += ` ORDER BY s.created_at DESC`;

    const students = await query(sql, params);
    res.json({ students });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch students for admin.', details: err.message });
  }
}

export async function toggleStudentActive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = Number(req.params.id);
    const student = await queryOne('SELECT user_id, full_name FROM students WHERE id = ?', [studentId]);
    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const user = await queryOne('SELECT is_active FROM users WHERE id = ?', [student.user_id]);
    const newStatus = user.is_active ? 0 : 1;

    await execute('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, student.user_id]);

    await execute(
      'INSERT INTO admin_actions (admin_user_id, action_type, target_entity, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [
        req.user?.id,
        newStatus ? 'ACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
        'students',
        studentId,
        `Student "${student.full_name}" status set to ${newStatus ? 'Active' : 'Inactive'}.`
      ]
    );

    res.json({
      message: `Student account ${newStatus ? 'activated' : 'deactivated'} successfully.`,
      isActive: Boolean(newStatus),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle student account state.', details: err.message });
  }
}

// --- Organization Management ---

export async function getAdminOrganizations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT c.*, u.is_active as user_active, cp.logo_url,
             (SELECT COUNT(*) FROM jobs WHERE company_id = c.id) as job_count,
             (SELECT COUNT(*) FROM recruitment_drives WHERE company_id = c.id) as drive_count
      FROM companies c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN company_profiles cp ON cp.company_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ` AND c.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (c.organization_name LIKE ? OR c.official_email LIKE ? OR c.industry LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const organizations = await query(sql, params);
    res.json({ organizations });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch organizations for admin.', details: err.message });
  }
}

export async function approveOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = Number(req.params.id);
    const company = await queryOne('SELECT user_id, organization_name FROM companies WHERE id = ?', [companyId]);
    if (!company) {
      res.status(404).json({ error: 'Company not found.' });
      return;
    }

    await execute("UPDATE companies SET status = 'approved', rejection_reason = NULL WHERE id = ?", [companyId]);

    // Send notification to recruiter
    await execute(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'admin', ?)`,
      [
        company.user_id,
        'Organization Approved! 🎉',
        `Congratulations! Administrator review for "${company.organization_name}" is complete. You can now post jobs, internships, courses, and recruitment drives.`,
        '/recruiter/dashboard'
      ]
    );

    await execute(
      'INSERT INTO admin_actions (admin_user_id, action_type, target_entity, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id, 'APPROVE_COMPANY', 'companies', companyId, `Approved company: ${company.organization_name}`]
    );

    res.json({ message: `Organization "${company.organization_name}" approved successfully!` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to approve organization.', details: err.message });
  }
}

export async function rejectOrganization(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = Number(req.params.id);
    const { reason } = req.body;

    const company = await queryOne('SELECT user_id, organization_name FROM companies WHERE id = ?', [companyId]);
    if (!company) {
      res.status(404).json({ error: 'Company not found.' });
      return;
    }

    await execute("UPDATE companies SET status = 'rejected', rejection_reason = ? WHERE id = ?", [reason || 'Documentation did not meet criteria.', companyId]);

    // Send notification to recruiter
    await execute(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'admin', ?)`,
      [
        company.user_id,
        'Organization Registration Update',
        `Your organization registration for "${company.organization_name}" was rejected. Reason: ${reason || 'Incomplete credentials.'}`,
        '/recruiter/pending'
      ]
    );

    await execute(
      'INSERT INTO admin_actions (admin_user_id, action_type, target_entity, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user?.id, 'REJECT_COMPANY', 'companies', companyId, `Rejected company: ${company.organization_name}. Reason: ${reason}`]
    );

    res.json({ message: `Organization "${company.organization_name}" rejected.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reject organization.', details: err.message });
  }
}

// --- Content Moderation ---

export async function getModerationItems(req: AuthRequest, res: Response): Promise<void> {
  try {
    const jobs = await query(
      `SELECT j.id, j.title, j.location, j.status, j.created_at, c.organization_name, 'job' as type
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       ORDER BY j.created_at DESC LIMIT 20`
    );

    const internships = await query(
      `SELECT i.id, i.title, i.location, i.status, i.created_at, c.organization_name, 'internship' as type
       FROM internships i
       JOIN companies c ON c.id = i.company_id
       ORDER BY i.created_at DESC LIMIT 20`
    );

    const courses = await query(
      `SELECT co.id, co.title, co.provider, co.status, co.created_at, 'course' as type
       FROM courses co
       ORDER BY co.created_at DESC LIMIT 20`
    );

    const drives = await query(
      `SELECT d.id, d.title, d.drive_date, d.status, d.created_at, c.organization_name, 'drive' as type
       FROM recruitment_drives d
       JOIN companies c ON c.id = d.company_id
       ORDER BY d.created_at DESC LIMIT 20`
    );

    res.json({
      items: [...jobs, ...internships, ...courses, ...drives].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch moderation items.', details: err.message });
  }
}

export async function moderateContent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { type, id, action } = req.body; // type: 'job'|'internship'|'course'|'drive', action: 'publish'|'reject'|'close'

    let table = 'jobs';
    if (type === 'internship') table = 'internships';
    else if (type === 'course') table = 'courses';
    else if (type === 'drive') table = 'recruitment_drives';

    let newStatus = 'published';
    if (action === 'reject') newStatus = 'rejected';
    else if (action === 'close') newStatus = 'closed';

    await execute(`UPDATE ${table} SET status = ? WHERE id = ?`, [newStatus, Number(id)]);

    res.json({ message: `Item (${type}) status updated to ${newStatus}.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to moderate item.', details: err.message });
  }
}

// --- Platform Analytics ---

export async function getAdminAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentsByBranch = await query(
      `SELECT branch as name, COUNT(*) as count FROM students GROUP BY branch`
    );

    const studentsByDegree = await query(
      `SELECT degree as name, COUNT(*) as count FROM students GROUP BY degree`
    );

    const appsByStatus = await query(
      `SELECT status as name, COUNT(*) as count FROM applications GROUP BY status`
    );

    const oppDistribution = [
      { name: 'Jobs', count: Number((await queryOne('SELECT COUNT(*) as c FROM jobs')).c || 0) },
      { name: 'Internships', count: Number((await queryOne('SELECT COUNT(*) as c FROM internships')).c || 0) },
      { name: 'Courses', count: Number((await queryOne('SELECT COUNT(*) as c FROM courses')).c || 0) },
      { name: 'Campus Drives', count: Number((await queryOne('SELECT COUNT(*) as c FROM recruitment_drives')).c || 0) },
    ];

    res.json({
      studentsByBranch,
      studentsByDegree,
      appsByStatus,
      oppDistribution,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch platform analytics.', details: err.message });
  }
}

// --- Demo Data Management ---

export async function resetDemoData(req: AuthRequest, res: Response): Promise<void> {
  try {
    await seedDatabase();
    res.json({ message: 'Demo database re-seeded successfully with realistic entities!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to re-seed database.', details: err.message });
  }
}
