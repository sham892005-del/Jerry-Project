import { Response } from 'express';
import { AuthRequest } from '../types';
import { query, queryOne, execute } from '../database/db';
import { AIService } from '../services/ai.service';

// --- Profile & Personal Details ---

export async function getStudentProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student profile not found.' });
      return;
    }

    const student = await queryOne(
      `SELECT s.*, p.bio, p.career_goal, p.preferred_job_role, p.preferred_industry, p.preferred_location, p.completion_percentage
       FROM students s
       LEFT JOIN student_profiles p ON p.student_id = s.id
       WHERE s.id = ?`,
      [studentId]
    );

    const skills = await query(
      `SELECT ss.id as student_skill_id, ss.proficiency_level, ss.type, sk.id as skill_id, sk.name, sk.category
       FROM student_skills ss
       JOIN skills sk ON sk.id = ss.skill_id
       WHERE ss.student_id = ?`,
      [studentId]
    );

    const interests = await query(
      `SELECT id, interest_name FROM student_interests WHERE student_id = ?`,
      [studentId]
    );

    const privacy = await queryOne(
      `SELECT * FROM privacy_settings WHERE student_id = ?`,
      [studentId]
    );

    res.json({
      student,
      skills,
      interests: interests.map((i: any) => i.interest_name),
      privacy: privacy || {
        show_cgpa: 1,
        show_email: 1,
        show_phone: 0,
        show_skills: 1,
        show_interests: 1,
        show_career_goal: 1,
        allow_recruiter_messages: 1,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve student profile.', details: err.message });
  }
}

export async function updateStudentProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const {
      fullName,
      degree,
      branch,
      graduationYear,
      college,
      cgpa,
      phone,
      bio,
      careerGoal,
      preferredJobRole,
      preferredIndustry,
      preferredLocation,
      profilePhoto,
    } = req.body;

    // Update students table
    await execute(
      `UPDATE students
       SET full_name = ?, degree = ?, branch = ?, graduation_year = ?, college = ?, cgpa = ?, phone = ?, profile_photo = ?
       WHERE id = ?`,
      [
        fullName || '',
        degree || '',
        branch || '',
        Number(graduationYear) || 2025,
        college || '',
        Number(cgpa) || 0.0,
        phone || '',
        profilePhoto || '',
        studentId,
      ]
    );

    // Calculate dynamic profile completion percentage
    let completion = 20; // base from signup
    if (college) completion += 10;
    if (cgpa && cgpa > 0) completion += 15;
    if (bio && bio.length > 20) completion += 15;
    if (careerGoal) completion += 15;
    if (preferredJobRole) completion += 10;
    if (phone) completion += 5;

    // Check if student has skills
    const skillCount = await queryOne('SELECT COUNT(*) as count FROM student_skills WHERE student_id = ?', [studentId]);
    if (skillCount && skillCount.count > 0) completion += 10;

    completion = Math.min(completion, 100);

    // Update student_profiles table
    await execute(
      `UPDATE student_profiles
       SET bio = ?, career_goal = ?, preferred_job_role = ?, preferred_industry = ?, preferred_location = ?, completion_percentage = ?
       WHERE student_id = ?`,
      [
        bio || '',
        careerGoal || '',
        preferredJobRole || '',
        preferredIndustry || '',
        preferredLocation || '',
        completion,
        studentId,
      ]
    );

    res.json({ message: 'Profile updated successfully!', completionPercentage: completion });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile.', details: err.message });
  }
}

export async function updateStudentSkills(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { skills } = req.body; // Array of { name: string, proficiency: number, type?: string }
    if (!Array.isArray(skills)) {
      res.status(400).json({ error: 'Skills must be an array.' });
      return;
    }

    // Clear existing skills for clean re-sync
    await execute('DELETE FROM student_skills WHERE student_id = ?', [studentId]);

    for (const item of skills) {
      if (!item.name) continue;

      // Find or insert skill into catalog
      let skill = await queryOne('SELECT id, category FROM skills WHERE LOWER(name) = ?', [item.name.toLowerCase().trim()]);
      if (!skill) {
        const insertSkill = await execute(
          'INSERT INTO skills (name, category) VALUES (?, ?)',
          [item.name.trim(), item.type || 'technical']
        );
        skill = { id: insertSkill.insertId, category: item.type || 'technical' };
      }

      await execute(
        'INSERT INTO student_skills (student_id, skill_id, proficiency_level, type) VALUES (?, ?, ?, ?)',
        [studentId, skill.id, Math.min(100, Math.max(10, Number(item.proficiency) || 60)), item.type || skill.category]
      );
    }

    res.json({ message: 'Skills updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update skills.', details: err.message });
  }
}

export async function updateStudentInterests(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { interests } = req.body; // Array of strings
    if (!Array.isArray(interests)) {
      res.status(400).json({ error: 'Interests must be an array of strings.' });
      return;
    }

    await execute('DELETE FROM student_interests WHERE student_id = ?', [studentId]);

    for (const item of interests) {
      if (item && item.trim()) {
        await execute(
          'INSERT INTO student_interests (student_id, interest_name) VALUES (?, ?)',
          [studentId, item.trim()]
        );
      }
    }

    res.json({ message: 'Interests updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update interests.', details: err.message });
  }
}

export async function updatePrivacySettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const {
      show_cgpa,
      show_email,
      show_phone,
      show_skills,
      show_interests,
      show_career_goal,
      allow_recruiter_messages,
    } = req.body;

    await execute(
      `UPDATE privacy_settings
       SET show_cgpa = ?, show_email = ?, show_phone = ?, show_skills = ?, show_interests = ?, show_career_goal = ?, allow_recruiter_messages = ?
       WHERE student_id = ?`,
      [
        show_cgpa ? 1 : 0,
        show_email ? 1 : 0,
        show_phone ? 1 : 0,
        show_skills ? 1 : 0,
        show_interests ? 1 : 0,
        show_career_goal ? 1 : 0,
        allow_recruiter_messages ? 1 : 0,
        studentId,
      ]
    );

    res.json({ message: 'Privacy preferences saved successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update privacy settings.', details: err.message });
  }
}

// --- Student Dashboard Overview ---

export async function getStudentDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const student = await queryOne(
      `SELECT s.*, p.bio, p.career_goal, p.preferred_job_role, p.completion_percentage
       FROM students s
       LEFT JOIN student_profiles p ON p.student_id = s.id
       WHERE s.id = ?`,
      [studentId]
    );

    // AI Career Recommendations
    const aiData = await AIService.getCareerRecommendations(studentId);
    const topCareer = aiData.recommendations[0] || null;

    // Upcoming recruitment drives
    const upcomingDrives = await query(
      `SELECT d.*, c.organization_name, cp.logo_url
       FROM recruitment_drives d
       JOIN companies c ON c.id = d.company_id
       LEFT JOIN company_profiles cp ON cp.company_id = c.id
       WHERE d.status = 'published' AND d.drive_date >= CURRENT_DATE
       ORDER BY d.drive_date ASC
       LIMIT 3`
    );

    // Recent applications
    const recentApplications = await query(
      `SELECT a.*,
        CASE
          WHEN a.item_type = 'job' THEN (SELECT title FROM jobs WHERE id = a.item_id)
          WHEN a.item_type = 'internship' THEN (SELECT title FROM internships WHERE id = a.item_id)
          WHEN a.item_type = 'drive' THEN (SELECT title FROM recruitment_drives WHERE id = a.item_id)
        END as opportunity_title,
        CASE
          WHEN a.item_type = 'job' THEN (SELECT c.organization_name FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = a.item_id)
          WHEN a.item_type = 'internship' THEN (SELECT c.organization_name FROM internships i JOIN companies c ON c.id = i.company_id WHERE i.id = a.item_id)
          WHEN a.item_type = 'drive' THEN (SELECT c.organization_name FROM recruitment_drives rd JOIN companies c ON c.id = rd.company_id WHERE rd.id = a.item_id)
        END as company_name
       FROM applications a
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC
       LIMIT 5`,
      [studentId]
    );

    // Application counts by status
    const appCounts = await query(
      `SELECT status, COUNT(*) as count FROM applications WHERE student_id = ? GROUP BY status`,
      [studentId]
    );
    const statusSummary: Record<string, number> = {
      applied: 0,
      under_review: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    };
    appCounts.forEach((r: any) => {
      statusSummary[r.status] = Number(r.count);
    });

    // Recommended courses
    const recommendedCourses = await query(
      `SELECT * FROM courses WHERE status = 'published' LIMIT 3`
    );

    // Recommended jobs
    const recommendedJobs = await query(
      `SELECT j.*, c.organization_name, cp.logo_url
       FROM jobs j
       JOIN companies c ON c.id = j.company_id
       LEFT JOIN company_profiles cp ON cp.company_id = c.id
       WHERE j.status = 'published'
       ORDER BY j.created_at DESC
       LIMIT 3`
    );

    // Saved count
    const savedCountRes = await queryOne(
      `SELECT COUNT(*) as count FROM bookmarks WHERE student_id = ?`,
      [studentId]
    );

    res.json({
      student,
      topCareer,
      recommendations: aiData.recommendations,
      aiProvider: aiData.provider,
      statusSummary,
      upcomingDrives,
      recentApplications,
      recommendedCourses,
      recommendedJobs,
      savedCount: Number(savedCountRes?.count || 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load student dashboard.', details: err.message });
  }
}

// --- AI Recommendations & Skill Gap ---

export async function getRecommendations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const data = await AIService.getCareerRecommendations(studentId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate recommendations.', details: err.message });
  }
}

export async function getSkillGap(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    const careerId = Number(req.params.careerId);
    if (!studentId || !careerId) {
      res.status(400).json({ error: 'Valid career ID is required.' });
      return;
    }

    const data = await AIService.getSkillGapAnalysis(studentId, careerId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute skill gap analysis.', details: err.message });
  }
}

// --- Personalized Roadmap ---

export async function getRoadmap(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    let roadmap = await queryOne(
      `SELECT r.*, c.title as career_title, c.category as career_category
       FROM roadmaps r
       JOIN careers c ON c.id = r.career_id
       WHERE r.student_id = ?
       ORDER BY r.updated_at DESC
       LIMIT 1`,
      [studentId]
    );

    // If no roadmap exists, automatically generate one for the student's top recommended career
    if (!roadmap) {
      const recs = await AIService.getCareerRecommendations(studentId);
      const targetCareerId = recs.recommendations[0]?.careerId || 1;
      const career = await queryOne('SELECT * FROM careers WHERE id = ?', [targetCareerId]);

      const createRes = await execute(
        `INSERT INTO roadmaps (student_id, career_id, title, target_role, total_stages, completed_stages)
         VALUES (?, ?, ?, ?, 6, 0)`,
        [studentId, targetCareerId, `${career.title} Mastery Roadmap`, career.title]
      );
      const newRoadmapId = createRes.insertId;

      const stages = [
        { num: 1, title: 'Stage 1 — Fundamentals', desc: `Foundational programming and core logic required for ${career.title}.`, skills: ['Computer Science Fundamentals', 'Syntax & Control Flow', 'Git & GitHub'], dur: '3 Weeks' },
        { num: 2, title: 'Stage 2 — Core Domain Skills', desc: `Primary libraries and frameworks used by working ${career.title}s.`, skills: ['Core Frameworks', 'Relational Databases', 'API Design'], dur: '4 Weeks' },
        { num: 3, title: 'Stage 3 — Advanced Architecture', desc: 'Scalability, testing strategies, performance optimization, and containerization.', skills: ['Docker', 'Caching', 'Architecture Patterns'], dur: '4 Weeks' },
        { num: 4, title: 'Stage 4 — Production Projects', desc: 'Build 2 portfolio capstones showcasing full end-to-end implementation.', skills: ['Full Project Lifecycle', 'Cloud Deployment'], dur: '4 Weeks' },
        { num: 5, title: 'Stage 5 — Interview Preparation', desc: 'Coding challenges, system design discussions, and mock behavioral interviews.', skills: ['Data Structures', 'System Design', 'Behavioral STAR'], dur: '3 Weeks' },
        { num: 6, title: 'Stage 6 — Job Readiness & Industry Polish', desc: 'Resume tailoring, LinkedIn optimization, and active recruitment drive applications.', skills: ['Portfolio Delivery', 'Negotiation', 'Team Leadership'], dur: '2 Weeks' },
      ];

      for (const st of stages) {
        await execute(
          `INSERT INTO roadmap_items (roadmap_id, stage_number, stage_title, description, skills_json, resources_json, estimated_duration, is_completed)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
          [newRoadmapId, st.num, st.title, st.desc, JSON.stringify(st.skills), JSON.stringify(['Documentation & Official Guides', 'Open Source Capstone']), st.dur]
        );
      }

      roadmap = await queryOne(
        `SELECT r.*, c.title as career_title, c.category as career_category
         FROM roadmaps r
         JOIN careers c ON c.id = r.career_id
         WHERE r.id = ?`,
        [newRoadmapId]
      );
    }

    const items = await query(
      `SELECT * FROM roadmap_items WHERE roadmap_id = ? ORDER BY stage_number ASC`,
      [roadmap.id]
    );

    const parsedItems = items.map((it: any) => ({
      ...it,
      skills: JSON.parse(it.skills_json || '[]'),
      resources: JSON.parse(it.resources_json || '[]'),
      is_completed: Boolean(it.is_completed),
    }));

    res.json({ roadmap, items: parsedItems });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve roadmap.', details: err.message });
  }
}

export async function toggleRoadmapItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    const itemId = Number(req.params.itemId);
    if (!studentId || !itemId) {
      res.status(400).json({ error: 'Valid stage item ID is required.' });
      return;
    }

    const item = await queryOne(
      `SELECT ri.*, r.student_id, r.id as r_id
       FROM roadmap_items ri
       JOIN roadmaps r ON r.id = ri.roadmap_id
       WHERE ri.id = ? AND r.student_id = ?`,
      [itemId, studentId]
    );

    if (!item) {
      res.status(404).json({ error: 'Roadmap stage item not found.' });
      return;
    }

    const newCompleted = item.is_completed ? 0 : 1;
    const completedAt = newCompleted ? new Date().toISOString() : null;

    await execute(
      `UPDATE roadmap_items SET is_completed = ?, completed_at = ? WHERE id = ?`,
      [newCompleted, completedAt, itemId]
    );

    // Update count in parent roadmap
    const countRes = await queryOne(
      `SELECT COUNT(*) as completed_count FROM roadmap_items WHERE roadmap_id = ? AND is_completed = 1`,
      [item.r_id]
    );
    const completedStages = Number(countRes?.completed_count || 0);

    await execute(
      `UPDATE roadmaps SET completed_stages = ? WHERE id = ?`,
      [completedStages, item.r_id]
    );

    res.json({
      message: newCompleted ? 'Stage marked as completed! 🎉' : 'Stage marked as incomplete.',
      isCompleted: Boolean(newCompleted),
      completedStages,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update roadmap item.', details: err.message });
  }
}

// --- Courses Discovery ---

export async function getCourses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, category, level, priceType } = req.query;
    let sql = `SELECT * FROM courses WHERE status = 'published'`;
    const params: any[] = [];

    if (search) {
      sql += ` AND (title LIKE ? OR description LIKE ? OR skill_tags LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (category && category !== 'all') {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (level && level !== 'all') {
      sql += ` AND level = ?`;
      params.push(level);
    }
    if (priceType && priceType !== 'all') {
      sql += ` AND price_type = ?`;
      params.push(priceType);
    }

    sql += ` ORDER BY rating DESC, created_at DESC`;

    const courses = await query(sql, params);

    // Attach bookmark status if logged-in student
    const studentId = req.user?.studentId;
    if (studentId) {
      const bookmarks = await query(
        `SELECT item_id FROM bookmarks WHERE student_id = ? AND item_type = 'course'`,
        [studentId]
      );
      const bookmarkedSet = new Set(bookmarks.map((b: any) => b.item_id));
      courses.forEach((c: any) => {
        c.is_bookmarked = bookmarkedSet.has(c.id);
      });
    }

    res.json({ courses });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch courses.', details: err.message });
  }
}

// --- Jobs Marketplace ---

export async function getJobs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, location, workMode, experience } = req.query;
    let sql = `
      SELECT j.*, c.organization_name, c.industry, cp.logo_url
      FROM jobs j
      JOIN companies c ON c.id = j.company_id
      LEFT JOIN company_profiles cp ON cp.company_id = c.id
      WHERE j.status = 'published'
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.required_skills LIKE ? OR c.organization_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (location && location !== 'all') {
      sql += ` AND j.location LIKE ?`;
      params.push(`%${location}%`);
    }
    if (workMode && workMode !== 'all') {
      sql += ` AND j.work_mode = ?`;
      params.push(workMode);
    }
    if (experience && experience !== 'all') {
      sql += ` AND j.experience_level LIKE ?`;
      params.push(`%${experience}%`);
    }

    sql += ` ORDER BY j.created_at DESC`;

    const jobs = await query(sql, params);

    const studentId = req.user?.studentId;
    if (studentId) {
      const bookmarks = await query(
        `SELECT item_id FROM bookmarks WHERE student_id = ? AND item_type = 'job'`,
        [studentId]
      );
      const bookmarkedSet = new Set(bookmarks.map((b: any) => b.item_id));

      const applied = await query(
        `SELECT item_id, status FROM applications WHERE student_id = ? AND item_type = 'job'`,
        [studentId]
      );
      const appliedMap = new Map(applied.map((a: any) => [a.item_id, a.status]));

      jobs.forEach((j: any) => {
        j.is_bookmarked = bookmarkedSet.has(j.id);
        j.application_status = appliedMap.get(j.id) || null;
      });
    }

    res.json({ jobs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch jobs.', details: err.message });
  }
}

// --- Internships ---

export async function getInternships(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, workMode, duration } = req.query;
    let sql = `
      SELECT i.*, c.organization_name, c.industry, cp.logo_url
      FROM internships i
      JOIN companies c ON c.id = i.company_id
      LEFT JOIN company_profiles cp ON cp.company_id = c.id
      WHERE i.status = 'published'
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (i.title LIKE ? OR i.description LIKE ? OR i.skills LIKE ? OR c.organization_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (workMode && workMode !== 'all') {
      sql += ` AND i.work_mode = ?`;
      params.push(workMode);
    }
    if (duration && duration !== 'all') {
      sql += ` AND i.duration LIKE ?`;
      params.push(`%${duration}%`);
    }

    sql += ` ORDER BY i.created_at DESC`;

    const internships = await query(sql, params);

    const studentId = req.user?.studentId;
    if (studentId) {
      const bookmarks = await query(
        `SELECT item_id FROM bookmarks WHERE student_id = ? AND item_type = 'internship'`,
        [studentId]
      );
      const bookmarkedSet = new Set(bookmarks.map((b: any) => b.item_id));

      const applied = await query(
        `SELECT item_id, status FROM applications WHERE student_id = ? AND item_type = 'internship'`,
        [studentId]
      );
      const appliedMap = new Map(applied.map((a: any) => [a.item_id, a.status]));

      internships.forEach((item: any) => {
        item.is_bookmarked = bookmarkedSet.has(item.id);
        item.application_status = appliedMap.get(item.id) || null;
      });
    }

    res.json({ internships });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch internships.', details: err.message });
  }
}

// --- Campus & Recruitment Drives ---

export async function getRecruitmentDrives(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search } = req.query;
    let sql = `
      SELECT d.*, c.organization_name, c.industry, cp.logo_url
      FROM recruitment_drives d
      JOIN companies c ON c.id = d.company_id
      LEFT JOIN company_profiles cp ON cp.company_id = c.id
      WHERE d.status = 'published'
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (d.title LIKE ? OR d.description LIKE ? OR d.required_skills LIKE ? OR c.organization_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY d.drive_date ASC`;

    const drives = await query(sql, params);

    const studentId = req.user?.studentId;
    let student: any = null;
    if (studentId) {
      student = await queryOne('SELECT cgpa, branch, degree FROM students WHERE id = ?', [studentId]);

      const bookmarks = await query(
        `SELECT item_id FROM bookmarks WHERE student_id = ? AND item_type = 'drive'`,
        [studentId]
      );
      const bookmarkedSet = new Set(bookmarks.map((b: any) => b.item_id));

      const applied = await query(
        `SELECT item_id, status FROM applications WHERE student_id = ? AND item_type = 'drive'`,
        [studentId]
      );
      const appliedMap = new Map(applied.map((a: any) => [a.item_id, a.status]));

      drives.forEach((d: any) => {
        d.is_bookmarked = bookmarkedSet.has(d.id);
        d.application_status = appliedMap.get(d.id) || null;

        // Verify eligibility in real-time
        if (student) {
          const meetsCgpa = (student.cgpa || 0) >= (d.min_cgpa || 0);
          const meetsBranch = !d.required_branch || d.required_branch.toLowerCase().includes(student.branch.toLowerCase()) || d.required_branch.toLowerCase().includes('any') || d.required_branch.toLowerCase().includes('all');
          d.is_eligible = meetsCgpa && meetsBranch;
          d.eligibility_reason = !meetsCgpa
            ? `Your CGPA (${student.cgpa}) is below the required threshold of ${d.min_cgpa}.`
            : (!meetsBranch ? `Required branch (${d.required_branch}) differs from your branch (${student.branch}).` : 'You meet all eligibility criteria!');
        }
      });
    }

    res.json({ drives });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch recruitment drives.', details: err.message });
  }
}

// --- Application Submission & Tracking ---

export async function applyToOpportunity(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student profile required to apply.' });
      return;
    }

    const { itemType, itemId, notes } = req.body;
    if (!itemType || !itemId || !['job', 'internship', 'drive'].includes(itemType)) {
      res.status(400).json({ error: 'Valid itemType (job, internship, drive) and itemId are required.' });
      return;
    }

    // Check duplicate application
    const existing = await queryOne(
      'SELECT id FROM applications WHERE student_id = ? AND item_type = ? AND item_id = ?',
      [studentId, itemType, itemId]
    );

    if (existing) {
      res.status(409).json({ error: 'You have already applied for this opportunity.' });
      return;
    }

    // If recruitment drive, verify eligibility backend-side
    let targetCompanyId: number | null = null;
    let targetTitle = '';

    if (itemType === 'drive') {
      const drive = await queryOne('SELECT * FROM recruitment_drives WHERE id = ?', [itemId]);
      if (!drive) {
        res.status(404).json({ error: 'Recruitment drive not found.' });
        return;
      }
      targetCompanyId = drive.company_id;
      targetTitle = drive.title;

      const student = await queryOne('SELECT cgpa, branch FROM students WHERE id = ?', [studentId]);
      if (student && (student.cgpa < drive.min_cgpa)) {
        res.status(400).json({ error: `Application rejected: Your CGPA (${student.cgpa}) does not satisfy the minimum required CGPA of ${drive.min_cgpa}.` });
        return;
      }
    } else if (itemType === 'job') {
      const job = await queryOne('SELECT company_id, title FROM jobs WHERE id = ?', [itemId]);
      if (!job) {
        res.status(404).json({ error: 'Job not found.' });
        return;
      }
      targetCompanyId = job.company_id;
      targetTitle = job.title;
    } else if (itemType === 'internship') {
      const intern = await queryOne('SELECT company_id, title FROM internships WHERE id = ?', [itemId]);
      if (!intern) {
        res.status(404).json({ error: 'Internship not found.' });
        return;
      }
      targetCompanyId = intern.company_id;
      targetTitle = intern.title;
    }

    const initialTimeline = JSON.stringify([
      { status: 'applied', date: new Date().toISOString(), note: 'Application submitted successfully via portal.' }
    ]);

    const appRes = await execute(
      `INSERT INTO applications (student_id, item_type, item_id, status, notes, timeline_events_json)
       VALUES (?, ?, ?, 'applied', ?, ?)`,
      [studentId, itemType, itemId, notes || '', initialTimeline]
    );

    // Notify recruiter company user
    if (targetCompanyId) {
      const companyUser = await queryOne('SELECT user_id FROM companies WHERE id = ?', [targetCompanyId]);
      if (companyUser) {
        const studentInfo = await queryOne('SELECT full_name FROM students WHERE id = ?', [studentId]);
        await execute(
          `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, 'application', ?)`,
          [
            companyUser.user_id,
            `New Application for ${targetTitle}`,
            `${studentInfo?.full_name || 'A student'} submitted an application for ${targetTitle}.`,
            '/recruiter/applications'
          ]
        );
      }
    }

    res.status(201).json({
      message: 'Application submitted successfully!',
      applicationId: appRes.insertId,
      status: 'applied',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit application.', details: err.message });
  }
}

export async function getStudentApplications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const applications = await query(
      `SELECT a.*,
        CASE
          WHEN a.item_type = 'job' THEN (SELECT title FROM jobs WHERE id = a.item_id)
          WHEN a.item_type = 'internship' THEN (SELECT title FROM internships WHERE id = a.item_id)
          WHEN a.item_type = 'drive' THEN (SELECT title FROM recruitment_drives WHERE id = a.item_id)
        END as opportunity_title,
        CASE
          WHEN a.item_type = 'job' THEN (SELECT c.organization_name FROM jobs j JOIN companies c ON c.id = j.company_id WHERE j.id = a.item_id)
          WHEN a.item_type = 'internship' THEN (SELECT c.organization_name FROM internships i JOIN companies c ON c.id = i.company_id WHERE i.id = a.item_id)
          WHEN a.item_type = 'drive' THEN (SELECT c.organization_name FROM recruitment_drives rd JOIN companies c ON c.id = rd.company_id WHERE rd.id = a.item_id)
        END as company_name,
        CASE
          WHEN a.item_type = 'job' THEN (SELECT cp.logo_url FROM jobs j JOIN company_profiles cp ON cp.company_id = j.company_id WHERE j.id = a.item_id)
          WHEN a.item_type = 'internship' THEN (SELECT cp.logo_url FROM internships i JOIN company_profiles cp ON cp.company_id = i.company_id WHERE i.id = a.item_id)
          WHEN a.item_type = 'drive' THEN (SELECT cp.logo_url FROM recruitment_drives rd JOIN company_profiles cp ON cp.company_id = rd.company_id WHERE rd.id = a.item_id)
        END as company_logo
       FROM applications a
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC`,
      [studentId]
    );

    const parsed = applications.map((a: any) => ({
      ...a,
      timeline: JSON.parse(a.timeline_events_json || '[]'),
    }));

    res.json({ applications: parsed });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve applications.', details: err.message });
  }
}

// --- Bookmarks / Saved Items ---

export async function toggleBookmark(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const { itemType, itemId } = req.body;
    if (!itemType || !itemId) {
      res.status(400).json({ error: 'itemType and itemId are required.' });
      return;
    }

    const existing = await queryOne(
      'SELECT id FROM bookmarks WHERE student_id = ? AND item_type = ? AND item_id = ?',
      [studentId, itemType, itemId]
    );

    if (existing) {
      await execute('DELETE FROM bookmarks WHERE id = ?', [existing.id]);
      res.json({ bookmarked: false, message: 'Removed from saved items.' });
    } else {
      await execute(
        'INSERT INTO bookmarks (student_id, item_type, item_id) VALUES (?, ?, ?)',
        [studentId, itemType, itemId]
      );
      res.json({ bookmarked: true, message: 'Saved successfully!' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle bookmark.', details: err.message });
  }
}

export async function getBookmarks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const savedJobs = await query(
      `SELECT b.id as bookmark_id, j.*, c.organization_name, cp.logo_url
       FROM bookmarks b
       JOIN jobs j ON j.id = b.item_id
       JOIN companies c ON c.id = j.company_id
       LEFT JOIN company_profiles cp ON cp.company_id = c.id
       WHERE b.student_id = ? AND b.item_type = 'job'`,
      [studentId]
    );

    const savedInternships = await query(
      `SELECT b.id as bookmark_id, i.*, c.organization_name, cp.logo_url
       FROM bookmarks b
       JOIN internships i ON i.id = b.item_id
       JOIN companies c ON c.id = i.company_id
       LEFT JOIN company_profiles cp ON cp.company_id = c.id
       WHERE b.student_id = ? AND b.item_type = 'internship'`,
      [studentId]
    );

    const savedCourses = await query(
      `SELECT b.id as bookmark_id, c.*
       FROM bookmarks b
       JOIN courses c ON c.id = b.item_id
       WHERE b.student_id = ? AND b.item_type = 'course'`,
      [studentId]
    );

    const savedDrives = await query(
      `SELECT b.id as bookmark_id, d.*, c.organization_name, cp.logo_url
       FROM bookmarks b
       JOIN recruitment_drives d ON d.id = b.item_id
       JOIN companies c ON c.id = d.company_id
       LEFT JOIN company_profiles cp ON cp.company_id = c.id
       WHERE b.student_id = ? AND b.item_type = 'drive'`,
      [studentId]
    );

    res.json({
      jobs: savedJobs,
      internships: savedInternships,
      courses: savedCourses,
      drives: savedDrives,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve saved items.', details: err.message });
  }
}

// --- Organizations Directory (Student View) ---

export async function getOrganizations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search } = req.query;
    let sql = `
      SELECT c.id, c.organization_name, c.org_type, c.industry, c.website, c.location, c.description, c.status,
             cp.logo_url, cp.about, cp.culture, cp.benefits, cp.employee_count,
             (SELECT COUNT(*) FROM jobs WHERE company_id = c.id AND status = 'published') as active_jobs_count,
             (SELECT COUNT(*) FROM internships WHERE company_id = c.id AND status = 'published') as active_internships_count,
             (SELECT COUNT(*) FROM recruitment_drives WHERE company_id = c.id AND status = 'published') as active_drives_count
      FROM companies c
      LEFT JOIN company_profiles cp ON cp.company_id = c.id
      WHERE c.status = 'approved'
    `;
    const params: any[] = [];

    if (search) {
      sql += ` AND (c.organization_name LIKE ? OR c.industry LIKE ? OR c.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY c.organization_name ASC`;

    const organizations = await query(sql, params);
    res.json({ organizations });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch organizations.', details: err.message });
  }
}

export async function expressInterestInOrg(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    const companyId = Number(req.params.companyId);
    const { message } = req.body;

    if (!studentId || !companyId) {
      res.status(400).json({ error: 'Valid company ID required.' });
      return;
    }

    const company = await queryOne('SELECT user_id, organization_name FROM companies WHERE id = ?', [companyId]);
    if (!company) {
      res.status(404).json({ error: 'Organization not found.' });
      return;
    }

    const student = await queryOne('SELECT full_name, degree, branch, cgpa FROM students WHERE id = ?', [studentId]);

    // Send in-platform interest notification to the recruiter
    await execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, ?, ?, 'interest', '/recruiter/students')`,
      [
        company.user_id,
        `Student Expressed Interest in ${company.organization_name}`,
        `${student?.full_name} (${student?.degree} in ${student?.branch}, CGPA ${student?.cgpa}) expressed interest in career opportunities with your firm: "${message || 'I am keen on exploring opportunities at your organization.'}"`
      ]
    );

    res.json({ message: 'Interest expressed successfully! The recruitment team has been notified.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to express interest.', details: err.message });
  }
}

// --- AI Career Advisor Chat Sessions ---

export async function getChatSessions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    if (!studentId) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const sessions = await query(
      `SELECT * FROM chat_sessions WHERE student_id = ? ORDER BY updated_at DESC`,
      [studentId]
    );

    res.json({ sessions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch chat sessions.', details: err.message });
  }
}

export async function getChatMessages(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    const sessionId = Number(req.params.sessionId);
    if (!studentId || !sessionId) {
      res.status(400).json({ error: 'Valid session ID required.' });
      return;
    }

    // Verify session belongs to student
    const session = await queryOne(
      'SELECT id, title FROM chat_sessions WHERE id = ? AND student_id = ?',
      [sessionId, studentId]
    );
    if (!session) {
      res.status(404).json({ error: 'Chat session not found.' });
      return;
    }

    const messages = await query(
      `SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC`,
      [sessionId]
    );

    const parsed = messages.map((m: any) => ({
      ...m,
      suggestedPrompts: JSON.parse(m.suggested_prompts_json || '[]'),
    }));

    res.json({ session, messages: parsed });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch chat messages.', details: err.message });
  }
}

export async function sendChatMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user?.studentId;
    let { sessionId, message } = req.body;

    if (!studentId || !message || !message.trim()) {
      res.status(400).json({ error: 'Message content is required.' });
      return;
    }

    // Create session if not exists
    if (!sessionId) {
      const sessRes = await execute(
        'INSERT INTO chat_sessions (student_id, title) VALUES (?, ?)',
        [studentId, message.slice(0, 35) + '...']
      );
      sessionId = sessRes.insertId;
    }

    // 1. Insert user message
    await execute(
      'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
      [sessionId, 'user', message.trim()]
    );

    // 2. Fetch recent conversation history
    const history = await query(
      'SELECT sender, message FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 8',
      [sessionId]
    );

    // 3. Generate response from AI service
    const aiResponse = await AIService.generateAdvisorResponse(studentId, message.trim(), history);

    // 4. Insert assistant message
    const botMsgRes = await execute(
      'INSERT INTO chat_messages (session_id, sender, message, suggested_prompts_json) VALUES (?, ?, ?, ?)',
      [sessionId, 'assistant', aiResponse.reply, JSON.stringify(aiResponse.suggestedPrompts)]
    );

    // Update session timestamp
    await execute('UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [sessionId]);

    res.json({
      sessionId,
      message: {
        id: botMsgRes.insertId,
        sessionId,
        sender: 'assistant',
        message: aiResponse.reply,
        suggestedPrompts: aiResponse.suggestedPrompts,
        provider: aiResponse.provider,
        created_at: new Date().toISOString(),
      }
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to send chat message.', details: err.message });
  }
}

// --- Notifications ---

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthenticated.' });
      return;
    }

    const notifications = await query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    const unreadCountRes = await queryOne(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    res.json({
      notifications,
      unreadCount: Number(unreadCountRes?.count || 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications.', details: err.message });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const notifId = Number(req.params.id);

    if (notifId === 0) {
      // Mark all read
      await execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    } else {
      await execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notifId, userId]);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification.', details: err.message });
  }
}
