-- ==========================================================
-- AI-Assisted Career Guidance System - Normalized Database Schema
-- Compatible with MySQL 8.0+ and SQLite (via compatible DDL)
-- ==========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'student', -- 'student', 'recruiter', 'admin'
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  full_name VARCHAR(191) NOT NULL,
  degree VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  graduation_year INTEGER NOT NULL,
  college VARCHAR(191) DEFAULT 'National Institute of Technology',
  cgpa DECIMAL(4,2) DEFAULT 0.00,
  profile_photo VARCHAR(500) DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Student Profiles (Extended & Career Attributes)
CREATE TABLE IF NOT EXISTS student_profiles (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL UNIQUE,
  bio TEXT,
  career_goal VARCHAR(255) DEFAULT '',
  preferred_job_role VARCHAR(191) DEFAULT '',
  preferred_industry VARCHAR(191) DEFAULT '',
  preferred_location VARCHAR(191) DEFAULT '',
  completion_percentage INTEGER DEFAULT 20,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 4. Skills Catalog
CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL DEFAULT 'technical', -- 'programming', 'technical', 'soft', 'tool'
  description VARCHAR(255) DEFAULT ''
);

-- 5. Student Skills
CREATE TABLE IF NOT EXISTS student_skills (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  proficiency_level INTEGER NOT NULL DEFAULT 60, -- 1-100%
  type VARCHAR(50) DEFAULT 'technical',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(student_id, skill_id)
);

-- 6. Student Interests
CREATE TABLE IF NOT EXISTS student_interests (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL,
  interest_name VARCHAR(100) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 7. Privacy Settings (Strict Recruiter Visibility Controls)
CREATE TABLE IF NOT EXISTS privacy_settings (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL UNIQUE,
  show_cgpa INTEGER NOT NULL DEFAULT 1,
  show_email INTEGER NOT NULL DEFAULT 1,
  show_phone INTEGER NOT NULL DEFAULT 0,
  show_skills INTEGER NOT NULL DEFAULT 1,
  show_interests INTEGER NOT NULL DEFAULT 1,
  show_career_goal INTEGER NOT NULL DEFAULT 1,
  allow_recruiter_messages INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. Companies / Organizations Table
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  organization_name VARCHAR(191) NOT NULL,
  official_email VARCHAR(191) NOT NULL,
  org_type VARCHAR(100) NOT NULL DEFAULT 'Product Company', -- Startup, Enterprise, Agency
  industry VARCHAR(100) NOT NULL DEFAULT 'Information Technology',
  website VARCHAR(255) DEFAULT '',
  location VARCHAR(191) NOT NULL DEFAULT 'Bangalore, India',
  description TEXT,
  contact_phone VARCHAR(50) DEFAULT '',
  contact_person VARCHAR(191) DEFAULT '',
  status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Company Profiles
CREATE TABLE IF NOT EXISTS company_profiles (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL UNIQUE,
  logo_url VARCHAR(500) DEFAULT '',
  banner_url VARCHAR(500) DEFAULT '',
  about TEXT,
  culture TEXT,
  benefits TEXT,
  employee_count VARCHAR(50) DEFAULT '50-200',
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 10. Careers Taxonomy
CREATE TABLE IF NOT EXISTS careers (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(191) NOT NULL UNIQUE,
  slug VARCHAR(191) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  average_salary VARCHAR(100) DEFAULT '$85,000 - $130,000',
  growth_rate VARCHAR(50) DEFAULT '+22% (High Growth)',
  responsibilities TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Career Required & Recommended Skills
CREATE TABLE IF NOT EXISTS career_skills (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  career_id INTEGER NOT NULL,
  skill_id INTEGER NOT NULL,
  importance VARCHAR(32) NOT NULL DEFAULT 'required', -- 'required', 'recommended'
  weight INTEGER NOT NULL DEFAULT 5, -- 1 to 10
  min_proficiency INTEGER NOT NULL DEFAULT 70,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE(career_id, skill_id)
);

-- 12. Courses Catalog
CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  posted_by_company_id INTEGER DEFAULT NULL,
  title VARCHAR(191) NOT NULL,
  provider VARCHAR(191) NOT NULL DEFAULT 'Coursera / edX',
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  skill_tags TEXT,
  level VARCHAR(32) NOT NULL DEFAULT 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  duration VARCHAR(100) NOT NULL DEFAULT '6 Weeks',
  price_type VARCHAR(32) NOT NULL DEFAULT 'free', -- 'free', 'paid'
  price DECIMAL(10,2) DEFAULT 0.00,
  course_url VARCHAR(500) NOT NULL DEFAULT 'https://example.com',
  rating DECIMAL(3,2) DEFAULT 4.8,
  status VARCHAR(32) NOT NULL DEFAULT 'published', -- 'pending', 'published', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by_company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- 13. Jobs Marketplace
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(191) NOT NULL,
  work_mode VARCHAR(32) NOT NULL DEFAULT 'onsite', -- 'remote', 'hybrid', 'onsite'
  salary_min INTEGER DEFAULT 600000,
  salary_max INTEGER DEFAULT 1200000,
  salary_currency VARCHAR(10) DEFAULT 'INR',
  experience_level VARCHAR(50) DEFAULT '0-2 Years (Fresher / Junior)',
  required_degree VARCHAR(100) DEFAULT 'B.Tech / B.E. / M.C.A.',
  required_branch VARCHAR(100) DEFAULT 'Any Engineering / CS / IT',
  required_skills TEXT,
  application_deadline DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'published', -- 'pending', 'published', 'closed', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 14. Internships
CREATE TABLE IF NOT EXISTS internships (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  duration VARCHAR(50) NOT NULL DEFAULT '3-6 Months',
  location VARCHAR(191) NOT NULL,
  work_mode VARCHAR(32) NOT NULL DEFAULT 'hybrid',
  stipend VARCHAR(100) DEFAULT '₹25,000 / month',
  skills TEXT,
  eligibility VARCHAR(255) DEFAULT 'Current 3rd or final year B.Tech / MCA students',
  application_deadline DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 15. Recruitment & Campus Drives
CREATE TABLE IF NOT EXISTS recruitment_drives (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  company_id INTEGER NOT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  drive_date DATE NOT NULL,
  venue_or_link VARCHAR(255) NOT NULL,
  eligibility TEXT,
  min_cgpa DECIMAL(4,2) DEFAULT 7.00,
  required_degree VARCHAR(100) DEFAULT 'B.Tech / B.E.',
  required_branch VARCHAR(100) DEFAULT 'CSE, IT, ECE',
  required_skills TEXT,
  selection_process TEXT,
  application_deadline DATE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- 16. Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL,
  item_type VARCHAR(32) NOT NULL, -- 'job', 'internship', 'drive'
  item_id INTEGER NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'applied', -- 'applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'
  notes TEXT,
  timeline_events_json TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, item_type, item_id)
);

-- 17. Bookmarks / Saved Items
CREATE TABLE IF NOT EXISTS bookmarks (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL,
  item_type VARCHAR(32) NOT NULL, -- 'job', 'internship', 'course', 'drive'
  item_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE(student_id, item_type, item_id)
);

-- 18. Personalized Roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL,
  career_id INTEGER NOT NULL,
  title VARCHAR(191) NOT NULL,
  target_role VARCHAR(191) NOT NULL,
  total_stages INTEGER NOT NULL DEFAULT 6,
  completed_stages INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- 19. Roadmap Items / Stages
CREATE TABLE IF NOT EXISTS roadmap_items (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  roadmap_id INTEGER NOT NULL,
  stage_number INTEGER NOT NULL, -- 1 to 6
  stage_title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  skills_json TEXT NOT NULL,
  resources_json TEXT NOT NULL,
  estimated_duration VARCHAR(50) NOT NULL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
);

-- 20. Skill Assessments & Match Scores Cache
CREATE TABLE IF NOT EXISTS skill_assessments (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL,
  career_id INTEGER NOT NULL,
  match_percentage INTEGER NOT NULL,
  current_skills_json TEXT,
  missing_skills_json TEXT,
  priority_skills_json TEXT,
  reasoning TEXT,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
);

-- 21. Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  student_id INTEGER NOT NULL,
  title VARCHAR(191) NOT NULL DEFAULT 'Career Guidance Session',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 22. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  session_id INTEGER NOT NULL,
  sender VARCHAR(32) NOT NULL, -- 'user', 'assistant'
  message TEXT NOT NULL,
  suggested_prompts_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 23. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'system', -- 'application', 'match', 'admin', 'interest', 'system'
  is_read INTEGER NOT NULL DEFAULT 0,
  link VARCHAR(255) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 24. Admin Actions Log
CREATE TABLE IF NOT EXISTS admin_actions (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  admin_user_id INTEGER NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_entity VARCHAR(100) NOT NULL,
  target_id INTEGER NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 25. Reports / Flags
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  reporter_user_id INTEGER NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexing for high-performance searches and joins
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_internships_company_id ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_drives_company_id ON recruitment_drives(company_id);
CREATE INDEX IF NOT EXISTS idx_apps_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
