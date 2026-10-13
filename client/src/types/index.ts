export type UserRole = 'student' | 'recruiter' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  studentId?: number;
  companyId?: number;
  companyStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  fullName?: string;
  organizationName?: string;
  degree?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  profilePhoto?: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  full_name: string;
  degree: string;
  branch: string;
  graduation_year: number;
  college: string;
  cgpa: number;
  profile_photo: string;
  phone: string;
  bio?: string;
  career_goal?: string;
  preferred_job_role?: string;
  preferred_industry?: string;
  preferred_location?: string;
  completion_percentage?: number;
}

export interface Skill {
  id: number;
  name: string;
  category: 'programming' | 'technical' | 'tool' | 'soft';
  proficiency_level?: number;
  type?: string;
}

export interface PrivacySettings {
  show_cgpa: number | boolean;
  show_email: number | boolean;
  show_phone: number | boolean;
  show_skills: number | boolean;
  show_interests: number | boolean;
  show_career_goal: number | boolean;
  allow_recruiter_messages: number | boolean;
}

export interface CareerRecommendation {
  careerId: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  averageSalary: string;
  growthRate: string;
  matchPercentage: number;
  reasoning: string;
  matchedSkills: Array<{ name: string; proficiency: number; importance: string }>;
  missingSkills: Array<{ name: string; requiredProficiency: number; importance: string }>;
  suggestedNextSteps: string[];
  recommendedCourses: Array<{ id: number; title: string; provider: string; level: string; priceType: string }>;
}

export interface SkillGapItem {
  skillName: string;
  category: string;
  importance: string;
  studentProficiency: number;
  requiredProficiency: number;
  gap: number;
  status: 'mastered' | 'proficient' | 'developing' | 'missing';
}

export interface SkillGapReport {
  careerId: number;
  careerTitle: string;
  readinessScore: number;
  totalRequiredSkills: number;
  masteredSkillsCount: number;
  skills: SkillGapItem[];
  prioritySkillsToLearn: string[];
  suggestedAction: string;
}

export interface RoadmapStage {
  id: number;
  roadmap_id: number;
  stage_number: number;
  stage_title: string;
  description: string;
  skills: string[];
  resources: string[];
  estimated_duration: string;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface Course {
  id: number;
  posted_by_company_id?: number | null;
  title: string;
  provider: string;
  description: string;
  category: string;
  skill_tags: string;
  level: string;
  duration: string;
  price_type: 'free' | 'paid';
  price: number;
  course_url: string;
  rating: number;
  status: string;
  is_bookmarked?: boolean;
}

export interface Job {
  id: number;
  company_id: number;
  organization_name: string;
  industry?: string;
  logo_url?: string;
  title: string;
  description: string;
  location: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  experience_level: string;
  required_degree: string;
  required_branch: string;
  required_skills: string;
  application_deadline: string;
  status: string;
  is_bookmarked?: boolean;
  application_status?: string | null;
  created_at: string;
}

export interface Internship {
  id: number;
  company_id: number;
  organization_name: string;
  industry?: string;
  logo_url?: string;
  title: string;
  description: string;
  duration: string;
  location: string;
  work_mode: 'remote' | 'hybrid' | 'onsite';
  stipend: string;
  skills: string;
  eligibility: string;
  application_deadline: string;
  status: string;
  is_bookmarked?: boolean;
  application_status?: string | null;
  created_at: string;
}

export interface RecruitmentDrive {
  id: number;
  company_id: number;
  organization_name: string;
  industry?: string;
  logo_url?: string;
  title: string;
  description: string;
  drive_date: string;
  venue_or_link: string;
  eligibility: string;
  min_cgpa: number;
  required_degree: string;
  required_branch: string;
  required_skills: string;
  selection_process: string;
  application_deadline: string;
  status: string;
  is_bookmarked?: boolean;
  application_status?: string | null;
  is_eligible?: boolean;
  eligibility_reason?: string;
  created_at: string;
}

export interface ApplicationTimelineEvent {
  status: string;
  date: string;
  note: string;
}

export interface Application {
  id: number;
  student_id: number;
  item_type: 'job' | 'internship' | 'drive';
  item_id: number;
  status: 'applied' | 'under_review' | 'shortlisted' | 'interview' | 'selected' | 'rejected';
  notes: string;
  opportunity_title: string;
  company_name: string;
  company_logo?: string;
  timeline: ApplicationTimelineEvent[];
  applied_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'application' | 'match' | 'admin' | 'interest' | 'system';
  is_read: number | boolean;
  link: string;
  created_at: string;
}

export interface Company {
  id: number;
  organization_name: string;
  official_email: string;
  org_type: string;
  industry: string;
  website: string;
  location: string;
  description: string;
  contact_phone: string;
  contact_person: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  logo_url?: string;
  banner_url?: string;
  about?: string;
  culture?: string;
  benefits?: string;
  employee_count?: string;
  active_jobs_count?: number;
  active_internships_count?: number;
  active_drives_count?: number;
}
