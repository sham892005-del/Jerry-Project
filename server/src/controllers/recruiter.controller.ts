import { Response } from 'express';
import { AuthRequest } from '../types';
import { query, queryOne, execute } from '../database/db';

// --- Recruiter Dashboard ---

export async function getRecruiterDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      res.status(404).json({ error: 'Company record not found.' });
      return;
    }

    const company = await queryOne(
      `SELECT c.*, cp.logo_url, cp.banner_url, cp.about, cp.culture, cp.benefits, cp.employee_count
       FROM companies c
       LEFT JOIN company_profiles cp ON cp.company_id = c.id
       WHERE c.id = ?`,
      [companyId]
    );

    // Counts
    const jobCount = await queryOne('SELECT COUNT(*) as count FROM jobs WHERE company_id = ?', [companyId]);
    const internCount = await queryOne('SELECT COUNT(*) as count FROM internships WHERE company_id = ?', [companyId]);
    const courseCount = await queryOne('SELECT COUNT(*) as count FROM courses WHERE posted_by_company_id = ?', [companyId]);
    const driveCount = await queryOne('SELECT COUNT(*) as count FROM recruitment_drives WHERE company_id = ?', [companyId]);

    // Total applications for this company's opportunities
    const applications = await query(
      `SELECT a.*, s.full_name, s.degree, s.branch, s.cgpa, ps.show_cgpa
       FROM applications a
       JOIN students s ON s.id = a.student_id
       LEFT JOIN privacy_settings ps ON ps.student_id = s.id
       WHERE (
         (a.item_type = 'job' AND a.item_id IN (SELECT id FROM jobs WHERE company_id = ?))
         OR
         (a.item_type = 'internship' AND a.item_id IN (SELECT id FROM internships WHERE company_id = ?))
         OR
         (a.item_type = 'drive' AND a.item_id IN (SELECT id FROM recruitment_drives WHERE company_id = ?))
       )
       ORDER BY a.applied_at DESC`,
      [companyId, companyId, companyId]
    );

    // Pipeline breakdown
    const pipeline: Record<string, number> = {
      applied: 0,
      under_review: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    };

    applications.forEach((a: any) => {
      pipeline[a.status] = (pipeline[a.status] || 0) + 1;
    });

    res.json({
      company,
      metrics: {
        totalJobs: Number(jobCount?.count || 0),
        totalInternships: Number(internCount?.count || 0),
        totalCourses: Number(courseCount?.count || 0),
        totalDrives: Number(driveCount?.count || 0),
        totalApplicants: applications.length,
      },
      pipeline,
      recentApplicants: applications.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load recruiter dashboard.', details: err.message });
  }
}

// --- Organization Profile ---

export async function getCompanyProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const company = await queryOne(
      `SELECT c.*, cp.logo_url, cp.banner_url, cp.about, cp.culture, cp.benefits, cp.employee_count
       FROM companies c
       LEFT JOIN company_profiles cp ON cp.company_id = c.id
       WHERE c.id = ?`,
      [companyId]
    );

    res.json({ company });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch company profile.', details: err.message });
  }
}

export async function updateCompanyProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const {
      organizationName,
      orgType,
      industry,
      website,
      location,
      description,
      contactPhone,
      contactPerson,
      logoUrl,
      bannerUrl,
      about,
      culture,
      benefits,
      employeeCount,
    } = req.body;

    await execute(
      `UPDATE companies
       SET organization_name = ?, org_type = ?, industry = ?, website = ?, location = ?, description = ?, contact_phone = ?, contact_person = ?
       WHERE id = ?`,
      [
        organizationName || '',
        orgType || 'Product Company',
        industry || 'Information Technology',
        website || '',
        location || '',
        description || '',
        contactPhone || '',
        contactPerson || '',
        companyId,
      ]
    );

    await execute(
      `UPDATE company_profiles
       SET logo_url = ?, banner_url = ?, about = ?, culture = ?, benefits = ?, employee_count = ?
       WHERE company_id = ?`,
      [
        logoUrl || '',
        bannerUrl || '',
        about || '',
        culture || '',
        benefits || '',
        employeeCount || '50-200',
        companyId,
      ]
    );

    res.json({ message: 'Company profile updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update company profile.', details: err.message });
  }
}

// --- Jobs Management (CRUD) ---

export async function getRecruiterJobs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const jobs = await query(
      `SELECT j.*, (SELECT COUNT(*) FROM applications WHERE item_type = 'job' AND item_id = j.id) as applicant_count
       FROM jobs j
       WHERE j.company_id = ?
       ORDER BY j.created_at DESC`,
      [companyId]
    );

    res.json({ jobs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch jobs.', details: err.message });
  }
}

export async function createJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const {
      title,
      description,
      location,
      workMode,
      salaryMin,
      salaryMax,
      experienceLevel,
      requiredDegree,
      requiredBranch,
      requiredSkills,
      applicationDeadline,
    } = req.body;

    if (!title || !description || !location) {
      res.status(400).json({ error: 'Title, description, and location are required.' });
      return;
    }

    const resJob = await execute(
      `INSERT INTO jobs (company_id, title, description, location, work_mode, salary_min, salary_max, experience_level, required_degree, required_branch, required_skills, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [
        companyId,
        title.trim(),
        description.trim(),
        location.trim(),
        workMode || 'onsite',
        Number(salaryMin) || 0,
        Number(salaryMax) || 0,
        experienceLevel || '0-2 Years',
        requiredDegree || 'B.Tech / B.E.',
        requiredBranch || 'Computer Science / IT',
        requiredSkills || '',
        applicationDeadline || null,
      ]
    );

    res.status(201).json({ message: 'Job posted successfully!', jobId: resJob.insertId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create job posting.', details: err.message });
  }
}

export async function updateJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const jobId = Number(req.params.id);
    const {
      title,
      description,
      location,
      workMode,
      salaryMin,
      salaryMax,
      experienceLevel,
      requiredDegree,
      requiredBranch,
      requiredSkills,
      applicationDeadline,
      status,
    } = req.body;

    await execute(
      `UPDATE jobs
       SET title = ?, description = ?, location = ?, work_mode = ?, salary_min = ?, salary_max = ?, experience_level = ?, required_degree = ?, required_branch = ?, required_skills = ?, application_deadline = ?, status = ?
       WHERE id = ? AND company_id = ?`,
      [
        title,
        description,
        location,
        workMode,
        salaryMin,
        salaryMax,
        experienceLevel,
        requiredDegree,
        requiredBranch,
        requiredSkills,
        applicationDeadline,
        status || 'published',
        jobId,
        companyId,
      ]
    );

    res.json({ message: 'Job posting updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update job.', details: err.message });
  }
}

export async function deleteJob(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const jobId = Number(req.params.id);

    await execute('DELETE FROM jobs WHERE id = ? AND company_id = ?', [jobId, companyId]);
    res.json({ message: 'Job deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete job.', details: err.message });
  }
}

// --- Internships Management (CRUD) ---

export async function getRecruiterInternships(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const internships = await query(
      `SELECT i.*, (SELECT COUNT(*) FROM applications WHERE item_type = 'internship' AND item_id = i.id) as applicant_count
       FROM internships i
       WHERE i.company_id = ?
       ORDER BY i.created_at DESC`,
      [companyId]
    );

    res.json({ internships });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch internships.', details: err.message });
  }
}

export async function createInternship(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const { title, description, duration, location, workMode, stipend, skills, eligibility, applicationDeadline } = req.body;

    if (!title || !description || !location) {
      res.status(400).json({ error: 'Title, description, and location are required.' });
      return;
    }

    const resIntern = await execute(
      `INSERT INTO internships (company_id, title, description, duration, location, work_mode, stipend, skills, eligibility, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [
        companyId,
        title.trim(),
        description.trim(),
        duration || '3-6 Months',
        location.trim(),
        workMode || 'hybrid',
        stipend || 'Unpaid',
        skills || '',
        eligibility || 'College Students',
        applicationDeadline || null,
      ]
    );

    res.status(201).json({ message: 'Internship posted successfully!', internshipId: resIntern.insertId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create internship.', details: err.message });
  }
}

export async function updateInternship(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const internshipId = Number(req.params.id);
    const { title, description, duration, location, workMode, stipend, skills, eligibility, applicationDeadline, status } = req.body;

    await execute(
      `UPDATE internships
       SET title = ?, description = ?, duration = ?, location = ?, work_mode = ?, stipend = ?, skills = ?, eligibility = ?, application_deadline = ?, status = ?
       WHERE id = ? AND company_id = ?`,
      [title, description, duration, location, workMode, stipend, skills, eligibility, applicationDeadline, status || 'published', internshipId, companyId]
    );

    res.json({ message: 'Internship updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update internship.', details: err.message });
  }
}

export async function deleteInternship(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const internshipId = Number(req.params.id);

    await execute('DELETE FROM internships WHERE id = ? AND company_id = ?', [internshipId, companyId]);
    res.json({ message: 'Internship deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete internship.', details: err.message });
  }
}

// --- Courses Management (CRUD) ---

export async function getRecruiterCourses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const courses = await query(
      `SELECT * FROM courses WHERE posted_by_company_id = ? ORDER BY created_at DESC`,
      [companyId]
    );

    res.json({ courses });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch courses.', details: err.message });
  }
}

export async function createCourse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const { title, provider, description, category, skillTags, level, duration, priceType, price, courseUrl } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ error: 'Title, description, and category are required.' });
      return;
    }

    const resCourse = await execute(
      `INSERT INTO courses (posted_by_company_id, title, provider, description, category, skill_tags, level, duration, price_type, price, course_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [
        companyId,
        title.trim(),
        provider || req.user?.organizationName || 'Tech Academy',
        description.trim(),
        category,
        skillTags || '',
        level || 'intermediate',
        duration || '4 Weeks',
        priceType || 'free',
        Number(price) || 0,
        courseUrl || 'https://example.com',
      ]
    );

    res.status(201).json({ message: 'Course created successfully!', courseId: resCourse.insertId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create course.', details: err.message });
  }
}

export async function updateCourse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const courseId = Number(req.params.id);
    const { title, provider, description, category, skillTags, level, duration, priceType, price, courseUrl, status } = req.body;

    await execute(
      `UPDATE courses
       SET title = ?, provider = ?, description = ?, category = ?, skill_tags = ?, level = ?, duration = ?, price_type = ?, price = ?, course_url = ?, status = ?
       WHERE id = ? AND posted_by_company_id = ?`,
      [title, provider, description, category, skillTags, level, duration, priceType, price, courseUrl, status || 'published', courseId, companyId]
    );

    res.json({ message: 'Course updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update course.', details: err.message });
  }
}

export async function deleteCourse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const courseId = Number(req.params.id);

    await execute('DELETE FROM courses WHERE id = ? AND posted_by_company_id = ?', [courseId, companyId]);
    res.json({ message: 'Course deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete course.', details: err.message });
  }
}

// --- Campus & Recruitment Drives Management ---

export async function getRecruiterDrives(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const drives = await query(
      `SELECT d.*, (SELECT COUNT(*) FROM applications WHERE item_type = 'drive' AND item_id = d.id) as applicant_count
       FROM recruitment_drives d
       WHERE d.company_id = ?
       ORDER BY d.drive_date ASC`,
      [companyId]
    );

    res.json({ drives });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch recruitment drives.', details: err.message });
  }
}

export async function createDrive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const {
      title,
      description,
      driveDate,
      venue,
      eligibility,
      minCgpa,
      requiredDegree,
      requiredBranch,
      requiredSkills,
      selectionProcess,
      applicationDeadline,
    } = req.body;

    if (!title || !description || !driveDate || !applicationDeadline) {
      res.status(400).json({ error: 'Title, description, drive date, and deadline are required.' });
      return;
    }

    const resDrive = await execute(
      `INSERT INTO recruitment_drives (company_id, title, description, drive_date, venue_or_link, eligibility, min_cgpa, required_degree, required_branch, required_skills, selection_process, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [
        companyId,
        title.trim(),
        description.trim(),
        driveDate,
        venue || 'Campus Auditorium / Virtual',
        eligibility || '',
        Number(minCgpa) || 7.0,
        requiredDegree || 'B.Tech / B.E.',
        requiredBranch || 'Computer Science / IT',
        requiredSkills || '',
        selectionProcess || 'Online Test -> Technical Interview -> HR Round',
        applicationDeadline,
      ]
    );

    res.status(201).json({ message: 'Recruitment drive created successfully!', driveId: resDrive.insertId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create recruitment drive.', details: err.message });
  }
}

export async function updateDrive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const driveId = Number(req.params.id);
    const {
      title,
      description,
      driveDate,
      venue,
      eligibility,
      minCgpa,
      requiredDegree,
      requiredBranch,
      requiredSkills,
      selectionProcess,
      applicationDeadline,
      status,
    } = req.body;

    await execute(
      `UPDATE recruitment_drives
       SET title = ?, description = ?, drive_date = ?, venue_or_link = ?, eligibility = ?, min_cgpa = ?, required_degree = ?, required_branch = ?, required_skills = ?, selection_process = ?, application_deadline = ?, status = ?
       WHERE id = ? AND company_id = ?`,
      [
        title,
        description,
        driveDate,
        venue,
        eligibility,
        minCgpa,
        requiredDegree,
        requiredBranch,
        requiredSkills,
        selectionProcess,
        applicationDeadline,
        status || 'published',
        driveId,
        companyId,
      ]
    );

    res.json({ message: 'Recruitment drive updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update recruitment drive.', details: err.message });
  }
}

export async function deleteDrive(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const driveId = Number(req.params.id);

    await execute('DELETE FROM recruitment_drives WHERE id = ? AND company_id = ?', [driveId, companyId]);
    res.json({ message: 'Recruitment drive deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete recruitment drive.', details: err.message });
  }
}

// --- Application Management & Visual Pipeline ---

export async function getCompanyApplications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const { status, type } = req.query;

    let sql = `
      SELECT a.*,
             s.full_name as student_name, s.degree, s.branch, s.graduation_year, s.cgpa, s.phone, u.email as student_email,
             ps.show_cgpa, ps.show_email, ps.show_phone, ps.show_skills, ps.show_career_goal,
             CASE
               WHEN a.item_type = 'job' THEN (SELECT title FROM jobs WHERE id = a.item_id)
               WHEN a.item_type = 'internship' THEN (SELECT title FROM internships WHERE id = a.item_id)
               WHEN a.item_type = 'drive' THEN (SELECT title FROM recruitment_drives WHERE id = a.item_id)
             END as opportunity_title
      FROM applications a
      JOIN students s ON s.id = a.student_id
      JOIN users u ON u.id = s.user_id
      LEFT JOIN privacy_settings ps ON ps.student_id = s.id
      WHERE (
        (a.item_type = 'job' AND a.item_id IN (SELECT id FROM jobs WHERE company_id = ?))
        OR
        (a.item_type = 'internship' AND a.item_id IN (SELECT id FROM internships WHERE company_id = ?))
        OR
        (a.item_type = 'drive' AND a.item_id IN (SELECT id FROM recruitment_drives WHERE company_id = ?))
      )
    `;
    const params: any[] = [companyId, companyId, companyId];

    if (status && status !== 'all') {
      sql += ` AND a.status = ?`;
      params.push(status);
    }
    if (type && type !== 'all') {
      sql += ` AND a.item_type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY a.applied_at DESC`;

    const applications = await query(sql, params);

    // Enforce student privacy settings on the backend
    const sanitized = applications.map((app: any) => {
      return {
        ...app,
        timeline: JSON.parse(app.timeline_events_json || '[]'),
        cgpa: app.show_cgpa ? app.cgpa : '[Hidden by Candidate]',
        student_email: app.show_email ? app.student_email : '[Hidden by Candidate]',
        phone: app.show_phone ? app.phone : '[Hidden by Candidate]',
      };
    });

    res.json({ applications: sanitized });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch company applications.', details: err.message });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const applicationId = Number(req.params.id);
    const { status, note } = req.body;

    const validStatuses = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid application status value.' });
      return;
    }

    // Verify application belongs to one of this company's listings
    const app = await queryOne(
      `SELECT a.*, s.user_id as student_user_id, s.full_name,
        CASE
          WHEN a.item_type = 'job' THEN (SELECT title FROM jobs WHERE id = a.item_id)
          WHEN a.item_type = 'internship' THEN (SELECT title FROM internships WHERE id = a.item_id)
          WHEN a.item_type = 'drive' THEN (SELECT title FROM recruitment_drives WHERE id = a.item_id)
        END as opportunity_title
       FROM applications a
       JOIN students s ON s.id = a.student_id
       WHERE a.id = ? AND (
         (a.item_type = 'job' AND a.item_id IN (SELECT id FROM jobs WHERE company_id = ?))
         OR
         (a.item_type = 'internship' AND a.item_id IN (SELECT id FROM internships WHERE company_id = ?))
         OR
         (a.item_type = 'drive' AND a.item_id IN (SELECT id FROM recruitment_drives WHERE company_id = ?))
       )`,
      [applicationId, companyId, companyId, companyId]
    );

    if (!app) {
      res.status(404).json({ error: 'Application not found or unauthorized.' });
      return;
    }

    // Append to timeline
    const timeline = JSON.parse(app.timeline_events_json || '[]');
    timeline.push({
      status,
      date: new Date().toISOString(),
      note: note || `Application advanced to ${status.replace('_', ' ').toUpperCase()}`,
    });

    await execute(
      `UPDATE applications
       SET status = ?, notes = ?, timeline_events_json = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, note || app.notes, JSON.stringify(timeline), applicationId]
    );

    // Create instant notification for student
    const statusLabel = status.replace('_', ' ').toUpperCase();
    await execute(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'application', ?)`,
      [
        app.student_user_id,
        `Application Update: ${statusLabel}`,
        `Your application for "${app.opportunity_title}" at ${req.user?.organizationName} has been updated to "${statusLabel}". ${note ? `Note: "${note}"` : ''}`,
        '/student/applications'
      ]
    );

    res.json({
      message: `Candidate status updated to ${statusLabel} successfully!`,
      status,
      timeline,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update application status.', details: err.message });
  }
}

// --- Find Students / Candidate Discovery (Respecting Privacy) ---

export async function findStudents(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { degree, branch, minCgpa, skill, interest } = req.query;

    let sql = `
      SELECT s.id, s.full_name, s.degree, s.branch, s.graduation_year, s.college, s.cgpa, s.phone,
             u.email,
             p.bio, p.career_goal, p.preferred_job_role, p.preferred_location,
             ps.show_cgpa, ps.show_email, ps.show_phone, ps.show_skills, ps.show_interests, ps.show_career_goal, ps.allow_recruiter_messages
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN student_profiles p ON p.student_id = s.id
      LEFT JOIN privacy_settings ps ON ps.student_id = s.id
      WHERE u.is_active = 1
    `;
    const params: any[] = [];

    if (degree && degree !== 'all') {
      sql += ` AND s.degree LIKE ?`;
      params.push(`%${degree}%`);
    }
    if (branch && branch !== 'all') {
      sql += ` AND s.branch LIKE ?`;
      params.push(`%${branch}%`);
    }
    if (minCgpa) {
      sql += ` AND s.cgpa >= ?`;
      params.push(Number(minCgpa));
    }

    sql += ` ORDER BY s.cgpa DESC, s.graduation_year ASC LIMIT 30`;

    const students = await query(sql, params);

    // Fetch skills for these students
    const studentIds = students.map((st: any) => st.id);
    let allSkills: any[] = [];
    if (studentIds.length > 0) {
      const placeholders = studentIds.map(() => '?').join(',');
      allSkills = await query(
        `SELECT ss.student_id, sk.name, ss.proficiency_level, ss.type
         FROM student_skills ss
         JOIN skills sk ON sk.id = ss.skill_id
         WHERE ss.student_id IN (${placeholders})`,
        studentIds
      );
    }

    const skillsByStudent: Record<number, any[]> = {};
    allSkills.forEach((sk: any) => {
      if (!skillsByStudent[sk.student_id]) skillsByStudent[sk.student_id] = [];
      skillsByStudent[sk.student_id].push(sk);
    });

    // Enforce privacy settings strictly
    const sanitizedStudents = students.map((s: any) => {
      const skills = s.show_skills ? (skillsByStudent[s.id] || []) : [];
      return {
        id: s.id,
        fullName: s.full_name,
        degree: s.degree,
        branch: s.branch,
        graduationYear: s.graduation_year,
        college: s.college,
        cgpa: s.show_cgpa ? s.cgpa : null,
        cgpaHidden: !s.show_cgpa,
        email: s.show_email ? s.email : null,
        phone: s.show_phone ? s.phone : null,
        bio: s.bio,
        careerGoal: s.show_career_goal ? s.career_goal : null,
        preferredJobRole: s.preferred_job_role,
        preferredLocation: s.preferred_location,
        skills,
        allowRecruiterMessages: Boolean(s.allow_recruiter_messages),
      };
    });

    // Filter by skill if requested
    let filtered = sanitizedStudents;
    if (skill && skill !== 'all') {
      const searchSkill = String(skill).toLowerCase();
      filtered = filtered.filter(st =>
        st.skills.some((sk: any) => sk.name.toLowerCase().includes(searchSkill))
      );
    }

    res.json({ students: filtered });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to search students.', details: err.message });
  }
}

export async function inviteStudent(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = Number(req.params.studentId);
    const { message, opportunityTitle } = req.body;

    const student = await queryOne('SELECT user_id, full_name FROM students WHERE id = ?', [studentId]);
    if (!student) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    await execute(
      `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'interest', ?)`,
      [
        student.user_id,
        `Recruiter Invitation from ${req.user?.organizationName}`,
        `${req.user?.organizationName} reviewed your profile and invited you to explore their ${opportunityTitle || 'opportunities'}: "${message || 'We are impressed by your credentials and encourage you to apply!'}"`,
        '/student/jobs'
      ]
    );

    res.json({ message: 'Invitation sent to candidate successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to send invitation.', details: err.message });
  }
}

// --- Recruiter Analytics ---

export async function getRecruiterAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;

    const applications = await query(
      `SELECT a.*, s.degree, s.branch, s.cgpa
       FROM applications a
       JOIN students s ON s.id = a.student_id
       WHERE (
         (a.item_type = 'job' AND a.item_id IN (SELECT id FROM jobs WHERE company_id = ?))
         OR
         (a.item_type = 'internship' AND a.item_id IN (SELECT id FROM internships WHERE company_id = ?))
         OR
         (a.item_type = 'drive' AND a.item_id IN (SELECT id FROM recruitment_drives WHERE company_id = ?))
       )`,
      [companyId, companyId, companyId]
    );

    // Distribution by branch
    const branchMap: Record<string, number> = {};
    const degreeMap: Record<string, number> = {};
    const cgpaBins = { '9.0+': 0, '8.0 - 8.9': 0, '7.0 - 7.9': 0, 'Below 7.0': 0 };

    applications.forEach((a: any) => {
      branchMap[a.branch] = (branchMap[a.branch] || 0) + 1;
      degreeMap[a.degree] = (degreeMap[a.degree] || 0) + 1;

      const cgpa = Number(a.cgpa);
      if (cgpa >= 9.0) cgpaBins['9.0+']++;
      else if (cgpa >= 8.0) cgpaBins['8.0 - 8.9']++;
      else if (cgpa >= 7.0) cgpaBins['7.0 - 7.9']++;
      else cgpaBins['Below 7.0']++;
    });

    const branchData = Object.keys(branchMap).map(name => ({ name, count: branchMap[name] }));
    const degreeData = Object.keys(degreeMap).map(name => ({ name, count: degreeMap[name] }));
    const cgpaData = Object.keys(cgpaBins).map(range => ({ range, count: (cgpaBins as any)[range] }));

    const selectedCount = applications.filter((a: any) => a.status === 'selected').length;
    const selectionRate = applications.length > 0 ? Math.round((selectedCount / applications.length) * 100) : 0;

    res.json({
      totalApplicants: applications.length,
      selectionRate,
      selectedCount,
      branchData,
      degreeData,
      cgpaData,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load recruiter analytics.', details: err.message });
  }
}
