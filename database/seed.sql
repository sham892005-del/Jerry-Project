-- ==========================================================
-- AI-Assisted Career Guidance System - Realistic MySQL Demo Seed Data
-- ==========================================================

-- Demo passwords (bcrypt hash for Student@123, Recruiter@123, Admin@123):
-- $2a$10$w09ZkKqEskn7rE197XqgD.iNnBvU2T60xVjA0Xm6o6b0iH4yZqVGy (Student@123)
-- $2a$10$7zB35x1Vq3M4K3X6J8mNzeY8N3xQ2G8W9u1o2P3q4R5s6T7u8V9w0 (Recruiter@123)
-- $2a$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A (Admin@123)

INSERT INTO users (id, email, password_hash, role, is_active) VALUES
(1, 'admin@demo.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iK21CddC', 'admin', 1),
(2, 'student@demo.com', '$2a$10$iI8j/m1t4V34v6VptfCke.a6UjB7M8f07gN92Rz39p5qf51950eE6', 'student', 1),
(3, 'aarav.sharma@demo.com', '$2a$10$iI8j/m1t4V34v6VptfCke.a6UjB7M8f07gN92Rz39p5qf51950eE6', 'student', 1),
(4, 'recruiter@demo.com', '$2a$10$22n9k86kC40R0y/j8X9N2.K7T2gP8o2T3G4f5l6K7M8N9P0Q1R2S3', 'recruiter', 1),
(5, 'recruiter@futurestack.demo', '$2a$10$22n9k86kC40R0y/j8X9N2.K7T2gP8o2T3G4f5l6K7M8N9P0Q1R2S3', 'recruiter', 1);

INSERT INTO students (id, user_id, full_name, degree, branch, graduation_year, college, cgpa, phone) VALUES
(1, 2, 'Alex Mercer (Demo Student)', 'B.Tech', 'Computer Science & Engineering', 2025, 'National Institute of Technology', 8.65, '+91 98765 43210'),
(2, 3, 'Aarav Sharma', 'B.Tech', 'Information Technology', 2025, 'Vellore Institute of Technology', 9.15, '+91 98111 22334');

INSERT INTO student_profiles (id, student_id, bio, career_goal, preferred_job_role, preferred_industry, preferred_location, completion_percentage) VALUES
(1, 1, 'Final-year CS student passionate about distributed systems, full stack cloud architectures, and machine learning pipelines.', 'Lead Software Architect or Full Stack Engineer at an innovation-driven tech company.', 'Full Stack Developer / Software Engineer', 'Information Technology & Cloud Services', 'Bangalore / Remote', 85),
(2, 2, 'Data analyst and ML practitioner with hands-on Kaggle experience.', 'Senior Data Scientist', 'Data Analyst / ML Engineer', 'Fintech & Analytics', 'Hyderabad / Bangalore', 90);

INSERT INTO privacy_settings (id, student_id, show_cgpa, show_email, show_phone, show_skills, show_interests, show_career_goal, allow_recruiter_messages) VALUES
(1, 1, 1, 1, 0, 1, 1, 1, 1),
(2, 2, 1, 1, 1, 1, 1, 1, 1);

INSERT INTO companies (id, user_id, organization_name, official_email, org_type, industry, website, location, description, contact_phone, contact_person, status) VALUES
(1, 4, 'TechNova Solutions', 'recruiter@demo.com', 'Enterprise Software', 'Cloud & AI Solutions', 'https://technova-solutions.demo', 'Bangalore, India', 'TechNova Solutions is a premier fictional enterprise software development firm specializing in cloud modernization and AI automation.', '+91 80 4123 4567', 'Sarah Jenkins (Talent Acquisition Lead)', 'approved'),
(2, 5, 'FutureStack Innovations', 'recruiter@futurestack.demo', 'Early-Stage Startup', 'Artificial Intelligence & Robotics', 'https://futurestack.demo', 'Bangalore, India', 'Pioneering agentic workflow assistants and developer tooling.', '+91 80 9988 7766', 'Kavita Nair (Co-founder & COO)', 'pending');

INSERT INTO company_profiles (id, company_id, logo_url, about, culture, benefits, employee_count) VALUES
(1, 1, 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80', 'Empowering modern enterprises with scalable cloud applications.', 'Open-source first, engineering excellence, work-from-anywhere.', 'Health insurance, ₹1,00,000 learning stipend, flexible hours.', '250-500');
