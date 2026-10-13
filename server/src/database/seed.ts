import bcrypt from 'bcryptjs';
import { initDatabase, execute, query, queryOne } from './db';

export async function seedDatabase() {
  console.log('🌱 Initializing Database and Seeding Demo Data...');
  await initDatabase();

  // Clear existing data cleanly in reverse FK order
  const tables = [
    'reports', 'admin_actions', 'notifications', 'chat_messages', 'chat_sessions',
    'skill_assessments', 'roadmap_items', 'roadmaps', 'bookmarks', 'applications',
    'recruitment_drives', 'internships', 'jobs', 'courses', 'career_skills',
    'careers', 'company_profiles', 'companies', 'privacy_settings', 'student_interests',
    'student_skills', 'skills', 'student_profiles', 'students', 'users'
  ];

  for (const tbl of tables) {
    try {
      await execute(`DELETE FROM ${tbl}`);
    } catch (e) {
      // Ignore if table not yet populated
    }
  }

  console.log('🧹 Cleared existing data.');

  // Password hashes
  const studentPw = await bcrypt.hash('Student@123', 10);
  const recruiterPw = await bcrypt.hash('Recruiter@123', 10);
  const adminPw = await bcrypt.hash('Admin@123', 10);

  // 1. Users
  // Admin
  const adminRes = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['admin@demo.com', adminPw, 'admin', 1]
  );
  const adminUserId = adminRes.insertId;

  // Demo Student
  const studentRes = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['student@demo.com', studentPw, 'student', 1]
  );
  const studentUserId = studentRes.insertId;

  // Peer Students (for recruiter search & admin metrics)
  const peer1Res = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['aarav.sharma@demo.com', studentPw, 'student', 1]
  );
  const peer2Res = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['priya.patel@demo.com', studentPw, 'student', 1]
  );
  const peer3Res = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['rohit.verma@demo.com', studentPw, 'student', 1]
  );

  // Demo Recruiter (TechNova Solutions - Approved)
  const recruiterRes = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['recruiter@demo.com', recruiterPw, 'recruiter', 1]
  );
  const recruiterUserId = recruiterRes.insertId;

  // Additional Recruiters
  const recNextGenRes = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['recruiter@nextgen.demo', recruiterPw, 'recruiter', 1]
  );
  const recCloudRes = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['recruiter@cloudsphere.demo', recruiterPw, 'recruiter', 1]
  );
  const recPendingRes = await execute(
    `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, ?, ?)`,
    ['recruiter@futurestack.demo', recruiterPw, 'recruiter', 1]
  );

  // 2. Students & Profiles
  // Demo Student profile: Alex Mercer (Computer Science, 8.65 CGPA)
  const alexRes = await execute(
    `INSERT INTO students (user_id, full_name, degree, branch, graduation_year, college, cgpa, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentUserId, 'Alex Mercer (Demo Student)', 'B.Tech', 'Computer Science & Engineering', 2025, 'National Institute of Technology', 8.65, '+91 98765 43210']
  );
  const alexStudentId = alexRes.insertId;

  await execute(
    `INSERT INTO student_profiles (student_id, bio, career_goal, preferred_job_role, preferred_industry, preferred_location, completion_percentage)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      alexStudentId,
      'Final-year CS student passionate about distributed systems, full stack cloud architectures, and machine learning pipelines.',
      'Lead Software Architect or Full Stack Engineer at an innovation-driven tech company.',
      'Full Stack Developer / Software Engineer',
      'Information Technology & Cloud Services',
      'Bangalore / Remote',
      85
    ]
  );

  await execute(
    `INSERT INTO privacy_settings (student_id, show_cgpa, show_email, show_phone, show_skills, show_interests, show_career_goal, allow_recruiter_messages)
     VALUES (?, 1, 1, 0, 1, 1, 1, 1)`,
    [alexStudentId]
  );

  // Peer 1: Aarav Sharma (Data & AI Enthusiast)
  const aaravRes = await execute(
    `INSERT INTO students (user_id, full_name, degree, branch, graduation_year, college, cgpa, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [peer1Res.insertId, 'Aarav Sharma', 'B.Tech', 'Information Technology', 2025, 'Vellore Institute of Technology', 9.15, '+91 98111 22334']
  );
  await execute(
    `INSERT INTO student_profiles (student_id, bio, career_goal, preferred_job_role, preferred_industry, preferred_location, completion_percentage)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [aaravRes.insertId, 'Data analyst and ML practitioner with hands-on Kaggle experience.', 'Senior Data Scientist', 'Data Analyst / ML Engineer', 'Fintech & Analytics', 'Hyderabad / Bangalore', 90]
  );
  await execute(
    `INSERT INTO privacy_settings (student_id, show_cgpa, show_email, show_phone, show_skills, show_interests, show_career_goal, allow_recruiter_messages)
     VALUES (?, 1, 1, 1, 1, 1, 1, 1)`,
    [aaravRes.insertId]
  );

  // Peer 2: Priya Patel (Cybersecurity & Networks)
  const priyaRes = await execute(
    `INSERT INTO students (user_id, full_name, degree, branch, graduation_year, college, cgpa, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [peer2Res.insertId, 'Priya Patel', 'B.Tech', 'Electronics & Communication', 2025, 'Delhi Technological University', 8.20, '+91 98444 55667']
  );
  await execute(
    `INSERT INTO student_profiles (student_id, bio, career_goal, preferred_job_role, preferred_industry, preferred_location, completion_percentage)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [priyaRes.insertId, 'Passionate about threat modeling, network security, and cloud defense.', 'Information Security Specialist', 'Cybersecurity Analyst', 'Cyber Defense & Security', 'Pune / Remote', 75]
  );
  await execute(
    `INSERT INTO privacy_settings (student_id, show_cgpa, show_email, show_phone, show_skills, show_interests, show_career_goal, allow_recruiter_messages)
     VALUES (?, 1, 0, 0, 1, 1, 1, 1)`,
    [priyaRes.insertId]
  );

  // Peer 3: Rohit Verma (UI/UX & Frontend)
  const rohitRes = await execute(
    `INSERT INTO students (user_id, full_name, degree, branch, graduation_year, college, cgpa, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [peer3Res.insertId, 'Rohit Verma', 'B.E.', 'Computer Engineering', 2026, 'BITS Pilani', 7.80, '+91 97777 88990']
  );
  await execute(
    `INSERT INTO student_profiles (student_id, bio, career_goal, preferred_job_role, preferred_industry, preferred_location, completion_percentage)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [rohitRes.insertId, 'Design-minded developer crafting accessible web interfaces and design systems.', 'Product Designer / Frontend Lead', 'UI/UX Designer', 'SaaS & Consumer Tech', 'Mumbai / Bangalore', 70]
  );
  await execute(
    `INSERT INTO privacy_settings (student_id, show_cgpa, show_email, show_phone, show_skills, show_interests, show_career_goal, allow_recruiter_messages)
     VALUES (?, 0, 1, 0, 1, 1, 1, 1)`,
    [rohitRes.insertId]
  );

  // 3. Companies (Clearly fictional organizations)
  // TechNova Solutions (Demo Recruiter - Approved)
  const compTechNova = await execute(
    `INSERT INTO companies (user_id, organization_name, official_email, org_type, industry, website, location, description, contact_phone, contact_person, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recruiterUserId,
      'TechNova Solutions',
      'recruiter@demo.com',
      'Enterprise Software',
      'Cloud & AI Solutions',
      'https://technova-solutions.demo',
      'Bangalore, India',
      'TechNova Solutions is a premier fictional enterprise software development firm specializing in cloud modernization, distributed microservices, and AI workflow automation.',
      '+91 80 4123 4567',
      'Sarah Jenkins (Talent Acquisition Lead)',
      'approved'
    ]
  );
  const techNovaId = compTechNova.insertId;
  await execute(
    `INSERT INTO company_profiles (company_id, logo_url, about, culture, benefits, employee_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      techNovaId,
      'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=80',
      'Empowering modern enterprises with scalable cloud applications and high-throughput data platforms.',
      'Open-source first, engineering excellence, work-from-anywhere flexibility, and continuous mentorship.',
      'Health insurance, ₹1,00,000 learning stipend, flexible hours, annual company retreats.',
      '250-500'
    ]
  );

  // NextGen Analytics (Approved)
  const compNextGen = await execute(
    `INSERT INTO companies (user_id, organization_name, official_email, org_type, industry, website, location, description, contact_phone, contact_person, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recNextGenRes.insertId,
      'NextGen Analytics',
      'recruiter@nextgen.demo',
      'Product Company',
      'Data Science & Analytics',
      'https://nextgen-analytics.demo',
      'Hyderabad, India',
      'NextGen Analytics builds intelligent business intelligence and predictive decision engines for modern commerce.',
      '+91 40 5566 7788',
      'Vikram Reddy (Head of People)',
      'approved'
    ]
  );
  const nextGenId = compNextGen.insertId;

  // CloudSphere Technologies (Approved)
  const compCloud = await execute(
    `INSERT INTO companies (user_id, organization_name, official_email, org_type, industry, website, location, description, contact_phone, contact_person, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recCloudRes.insertId,
      'CloudSphere Technologies',
      'recruiter@cloudsphere.demo',
      'Cloud Infrastructure',
      'DevOps & Infrastructure',
      'https://cloudsphere-tech.demo',
      'Pune, India',
      'CloudSphere delivers next-gen Kubernetes orchestration, cloud security posture management, and multi-cloud reliability.',
      '+91 20 6677 8899',
      'Ananya Sen (Director of HR)',
      'approved'
    ]
  );
  const cloudSphereId = compCloud.insertId;

  // FutureStack Innovations (Pending for Admin Approval Demo)
  const compPending = await execute(
    `INSERT INTO companies (user_id, organization_name, official_email, org_type, industry, website, location, description, contact_phone, contact_person, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recPendingRes.insertId,
      'FutureStack Innovations',
      'recruiter@futurestack.demo',
      'Early-Stage Startup',
      'Artificial Intelligence & Robotics',
      'https://futurestack.demo',
      'Bangalore, India',
      'Pioneering agentic workflow assistants and generative AI tooling for modern developer teams.',
      '+91 80 9988 7766',
      'Kavita Nair (Co-founder & COO)',
      'pending'
    ]
  );

  // 4. Skills Catalog
  const skillData = [
    // Programming
    { name: 'JavaScript', category: 'programming', description: 'Modern ECMAScript, ES6+, async/await' },
    { name: 'TypeScript', category: 'programming', description: 'Strict static typing, interfaces, generics' },
    { name: 'Python', category: 'programming', description: 'Scripting, OOP, data processing, backend' },
    { name: 'Java', category: 'programming', description: 'Object-oriented programming, Spring Boot, multithreading' },
    { name: 'C++', category: 'programming', description: 'Low-level systems, STL, memory management' },
    { name: 'SQL', category: 'programming', description: 'Relational query design, indexing, window functions' },
    { name: 'Go (Golang)', category: 'programming', description: 'Concurrent backend systems and microservices' },

    // Technical
    { name: 'React', category: 'technical', description: 'Hooks, state management, SPA architecture' },
    { name: 'Node.js', category: 'technical', description: 'Event-driven server runtime, Express, REST APIs' },
    { name: 'Docker', category: 'technical', description: 'Containerization, Dockerfile, multi-stage builds' },
    { name: 'Kubernetes', category: 'technical', description: 'Container orchestration, pods, services, ingress' },
    { name: 'AWS / Cloud', category: 'technical', description: 'EC2, S3, RDS, Lambda, IAM architectures' },
    { name: 'Machine Learning', category: 'technical', description: 'Supervised/unsupervised algorithms, Scikit-Learn' },
    { name: 'Deep Learning', category: 'technical', description: 'Neural networks, PyTorch, TensorFlow, LLMs' },
    { name: 'Data Structures & Algorithms', category: 'technical', description: 'Trees, graphs, dynamic programming, sorting' },
    { name: 'System Design', category: 'technical', description: 'Scalability, caching, load balancing, sharding' },
    { name: 'Cybersecurity', category: 'technical', description: 'OWASP Top 10, penetration testing, cryptography' },
    { name: 'DevOps & CI/CD', category: 'technical', description: 'GitHub Actions, GitLab CI, automated testing' },
    { name: 'Data Warehousing', category: 'technical', description: 'ETL pipelines, Snowflake, BigQuery, dbt' },
    { name: 'UI/UX Design', category: 'technical', description: 'Wireframing, prototyping, user research, design systems' },

    // Tools
    { name: 'Git & GitHub', category: 'tool', description: 'Version control, branching strategies, PR workflows' },
    { name: 'Linux / Bash', category: 'tool', description: 'Shell scripting, server administration, CLI tooling' },
    { name: 'PostgreSQL / MySQL', category: 'tool', description: 'Schema design, query optimization, ACID transactions' },
    { name: 'MongoDB', category: 'tool', description: 'NoSQL document storage, aggregation pipelines' },
    { name: 'Figma', category: 'tool', description: 'UI mockups, interactive prototyping, auto-layout' },
    { name: 'Tableau / PowerBI', category: 'tool', description: 'Data visualization dashboards and storytelling' },

    // Soft Skills
    { name: 'Communication', category: 'soft', description: 'Clear technical documentation and verbal presentations' },
    { name: 'Problem Solving', category: 'soft', description: 'Analytical breakdown of complex requirements' },
    { name: 'Teamwork & Collaboration', category: 'soft', description: 'Cross-functional agile team partnership' },
    { name: 'Leadership', category: 'soft', description: 'Mentorship, project ownership, initiative' }
  ];

  const skillIdMap: Record<string, number> = {};
  for (const s of skillData) {
    const res = await execute(
      `INSERT INTO skills (name, category, description) VALUES (?, ?, ?)`,
      [s.name, s.category, s.description]
    );
    skillIdMap[s.name] = res.insertId;
  }

  // Assign skills to Alex (Demo Student)
  const alexSkills = [
    { name: 'JavaScript', level: 85, type: 'programming' },
    { name: 'TypeScript', level: 80, type: 'programming' },
    { name: 'Python', level: 75, type: 'programming' },
    { name: 'SQL', level: 70, type: 'programming' },
    { name: 'React', level: 85, type: 'technical' },
    { name: 'Node.js', level: 80, type: 'technical' },
    { name: 'Data Structures & Algorithms', level: 80, type: 'technical' },
    { name: 'Docker', level: 65, type: 'technical' },
    { name: 'Git & GitHub', level: 90, type: 'tool' },
    { name: 'PostgreSQL / MySQL', level: 75, type: 'tool' },
    { name: 'Problem Solving', level: 85, type: 'soft' },
    { name: 'Teamwork & Collaboration', level: 80, type: 'soft' }
  ];

  for (const sk of alexSkills) {
    if (skillIdMap[sk.name]) {
      await execute(
        `INSERT INTO student_skills (student_id, skill_id, proficiency_level, type) VALUES (?, ?, ?, ?)`,
        [alexStudentId, skillIdMap[sk.name], sk.level, sk.type]
      );
    }
  }

  // Alex's Interests
  const alexInterests = ['Cloud Architecture', 'Web Development', 'Artificial Intelligence', 'Open Source Software'];
  for (const interest of alexInterests) {
    await execute(
      `INSERT INTO student_interests (student_id, interest_name) VALUES (?, ?)`,
      [alexStudentId, interest]
    );
  }

  // 5. Careers Taxonomy (14 In-depth Careers)
  const careersData = [
    {
      title: 'Full Stack Developer',
      slug: 'full-stack-developer',
      category: 'Software Engineering',
      description: 'Architects and builds both client-side interfaces and robust server-side APIs, database systems, and integration pipelines.',
      salary: '₹8,00,000 - ₹18,00,000 / yr',
      growth: '+24% (Very High)',
      responsibilities: 'Build responsive web apps, design scalable REST/GraphQL APIs, manage database schemas, and ensure high code quality.',
      required: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git & GitHub'],
      recommended: ['Docker', 'AWS / Cloud', 'Data Structures & Algorithms', 'PostgreSQL / MySQL']
    },
    {
      title: 'Software Developer',
      slug: 'software-developer',
      category: 'Software Engineering',
      description: 'Designs, develops, tests, and maintains robust software applications and distributed systems.',
      salary: '₹7,50,000 - ₹16,00,000 / yr',
      growth: '+22% (High)',
      responsibilities: 'Write maintainable code, implement business algorithms, collaborate with product teams, and debug production issues.',
      required: ['Data Structures & Algorithms', 'Java', 'Python', 'Git & GitHub', 'Problem Solving'],
      recommended: ['C++', 'SQL', 'System Design', 'Docker']
    },
    {
      title: 'Data Analyst',
      slug: 'data-analyst',
      category: 'Data & Analytics',
      description: 'Transforms raw corporate data into actionable business intelligence, visual dashboards, and strategic metrics.',
      salary: '₹6,50,000 - ₹14,00,000 / yr',
      growth: '+25% (High)',
      responsibilities: 'Extract and clean dataset records, build Tableau/PowerBI dashboards, perform cohort analysis, and present findings.',
      required: ['SQL', 'Python', 'Tableau / PowerBI', 'Problem Solving'],
      recommended: ['Data Warehousing', 'Communication', 'JavaScript']
    },
    {
      title: 'Data Scientist',
      slug: 'data-scientist',
      category: 'Data & Analytics',
      description: 'Leverages statistical modeling, machine learning, and advanced mathematics to discover predictive patterns in complex data.',
      salary: '₹10,00,000 - ₹22,00,000 / yr',
      growth: '+28% (Very High)',
      responsibilities: 'Design predictive models, conduct A/B hypothesis testing, engineer feature pipelines, and optimize loss functions.',
      required: ['Python', 'Machine Learning', 'SQL', 'Data Structures & Algorithms'],
      recommended: ['Deep Learning', 'Data Warehousing', 'AWS / Cloud']
    },
    {
      title: 'AI/ML Engineer',
      slug: 'ai-ml-engineer',
      category: 'Artificial Intelligence',
      description: 'Deploys, optimizes, and scales production machine learning architectures and foundation model applications.',
      salary: '₹12,00,000 - ₹25,00,000 / yr',
      growth: '+36% (Extremely High)',
      responsibilities: 'Train deep neural networks, build RAG pipelines, fine-tune LLMs, and manage low-latency model inference servers.',
      required: ['Python', 'Machine Learning', 'Deep Learning', 'Data Structures & Algorithms'],
      recommended: ['Docker', 'AWS / Cloud', 'Go (Golang)', 'Linux / Bash']
    },
    {
      title: 'Cloud Engineer',
      slug: 'cloud-engineer',
      category: 'Cloud & Infrastructure',
      description: 'Designs, secures, and oversees enterprise cloud environments, virtual networking, and storage infrastructures.',
      salary: '₹9,00,000 - ₹20,00,000 / yr',
      growth: '+27% (High)',
      responsibilities: 'Provision multi-region cloud resources, configure IAM policies, optimize cloud spending, and automate failovers.',
      required: ['AWS / Cloud', 'Linux / Bash', 'Docker', 'Git & GitHub'],
      recommended: ['Kubernetes', 'Python', 'System Design', 'Cybersecurity']
    },
    {
      title: 'DevOps Engineer',
      slug: 'devops-engineer',
      category: 'Cloud & Infrastructure',
      description: 'Bridges software development and operations by constructing automated CI/CD pipelines and infrastructure as code.',
      salary: '₹9,50,000 - ₹21,00,000 / yr',
      growth: '+26% (High)',
      responsibilities: 'Maintain continuous integration pipelines, monitor system reliability, orchestrate containers, and automate deployments.',
      required: ['Docker', 'Kubernetes', 'DevOps & CI/CD', 'Linux / Bash', 'Git & GitHub'],
      recommended: ['AWS / Cloud', 'Python', 'Go (Golang)', 'System Design']
    },
    {
      title: 'Cybersecurity Analyst',
      slug: 'cybersecurity-analyst',
      category: 'Security',
      description: 'Safeguards organizational digital assets, conducts threat hunting, audits access, and responds to security breaches.',
      salary: '₹8,50,000 - ₹18,50,000 / yr',
      growth: '+31% (Very High)',
      responsibilities: 'Perform vulnerability scans, investigate security alerts, configure firewalls, and enforce regulatory compliance.',
      required: ['Cybersecurity', 'Linux / Bash', 'Problem Solving'],
      recommended: ['Python', 'AWS / Cloud', 'SQL']
    },
    {
      title: 'UI/UX Designer',
      slug: 'ui-ux-designer',
      category: 'Product & Design',
      description: 'Designs intuitive, accessible, and delightful digital user interfaces, wireframes, and cohesive design systems.',
      salary: '₹6,50,000 - ₹15,00,000 / yr',
      growth: '+20% (Stable)',
      responsibilities: 'Conduct user research, design Figma mockups and design systems, create interactive prototypes, and collaborate with devs.',
      required: ['UI/UX Design', 'Figma', 'Communication', 'Problem Solving'],
      recommended: ['React', 'JavaScript']
    },
    {
      title: 'Business Analyst',
      slug: 'business-analyst',
      category: 'Product & Management',
      description: 'Analyzes business requirements, models operational workflows, and acts as the liaison between stakeholders and engineering.',
      salary: '₹7,00,000 - ₹15,00,000 / yr',
      growth: '+18% (Stable)',
      responsibilities: 'Gather requirements, draft user stories, analyze operational data, and present ROI proposals to leadership.',
      required: ['SQL', 'Tableau / PowerBI', 'Communication', 'Problem Solving'],
      recommended: ['Python', 'Teamwork & Collaboration', 'Leadership']
    },
    {
      title: 'Mobile App Developer',
      slug: 'mobile-app-developer',
      category: 'Software Engineering',
      description: 'Builds cross-platform or native mobile applications for iOS and Android devices with fluid touch experiences.',
      salary: '₹7,50,000 - ₹17,00,000 / yr',
      growth: '+21% (High)',
      responsibilities: 'Implement offline-first client architecture, integrate native device capabilities, optimize battery and memory usage.',
      required: ['React', 'JavaScript', 'TypeScript', 'Git & GitHub'],
      recommended: ['Data Structures & Algorithms', 'Java', 'UI/UX Design']
    },
    {
      title: 'Database Administrator',
      slug: 'database-administrator',
      category: 'Database & Systems',
      description: 'Ensures relational and distributed database clusters achieve peak query performance, zero data loss, and high availability.',
      salary: '₹8,00,000 - ₹17,50,000 / yr',
      growth: '+15% (Steady)',
      responsibilities: 'Tune slow query execution plans, plan disaster recovery and backups, manage replication topologies, and maintain schema integrity.',
      required: ['SQL', 'PostgreSQL / MySQL', 'Linux / Bash', 'Problem Solving'],
      recommended: ['Python', 'System Design', 'AWS / Cloud']
    },
    {
      title: 'Network Engineer',
      slug: 'network-engineer',
      category: 'Systems & Networks',
      description: 'Designs, implements, and maintains robust computer networks including LANs, WANs, and software-defined networks.',
      salary: '₹6,50,000 - ₹14,00,000 / yr',
      growth: '+14% (Steady)',
      responsibilities: 'Configure routers, switches, subnets, and VPNs; monitor latency, packet loss, and ensure uninterrupted throughput.',
      required: ['Linux / Bash', 'Problem Solving', 'Cybersecurity'],
      recommended: ['Python', 'AWS / Cloud']
    },
    {
      title: 'Product Manager',
      slug: 'product-manager',
      category: 'Product & Management',
      description: 'Guides the roadmap, prioritization, and execution of software products from conception through market launch.',
      salary: '₹12,00,000 - ₹28,00,000 / yr',
      growth: '+22% (High)',
      responsibilities: 'Define product vision, prioritize sprint backlogs, analyze customer telemetry, and align engineering with business goals.',
      required: ['Leadership', 'Communication', 'Problem Solving', 'Teamwork & Collaboration'],
      recommended: ['Tableau / PowerBI', 'UI/UX Design', 'SQL']
    }
  ];

  const careerIdMap: Record<string, number> = {};
  for (const c of careersData) {
    const res = await execute(
      `INSERT INTO careers (title, slug, category, description, average_salary, growth_rate, responsibilities)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.title, c.slug, c.category, c.description, c.salary, c.growth, c.responsibilities]
    );
    const cId = res.insertId;
    careerIdMap[c.title] = cId;

    for (const req of c.required) {
      if (skillIdMap[req]) {
        await execute(
          `INSERT INTO career_skills (career_id, skill_id, importance, weight, min_proficiency) VALUES (?, ?, 'required', 8, 70)`,
          [cId, skillIdMap[req]]
        );
      }
    }

    for (const rec of c.recommended) {
      if (skillIdMap[rec]) {
        await execute(
          `INSERT INTO career_skills (career_id, skill_id, importance, weight, min_proficiency) VALUES (?, ?, 'recommended', 5, 60)`,
          [cId, skillIdMap[rec]]
        );
      }
    }
  }

  // 6. Courses Catalog
  const coursesData = [
    {
      companyId: techNovaId,
      title: 'Modern Full-Stack Web Development with React & TypeScript',
      provider: 'CodeCraft Academy (Demo)',
      description: 'Master full-stack web applications from architectural fundamentals to production deployment with Docker and PostgreSQL.',
      category: 'Software Engineering',
      skillTags: 'React, TypeScript, Node.js, SQL',
      level: 'intermediate',
      duration: '8 Weeks',
      priceType: 'free',
      price: 0,
      url: 'https://example.com/courses/fullstack',
      rating: 4.9
    },
    {
      companyId: nextGenId,
      title: 'Python for Data Analysis & Statistical Modeling',
      provider: 'NextGen Analytics Lab',
      description: 'Practical data wrangling, Pandas pipelines, SQL aggregation, and exploratory analysis on real-world transaction sets.',
      category: 'Data & Analytics',
      skillTags: 'Python, SQL, Tableau / PowerBI',
      level: 'beginner',
      duration: '6 Weeks',
      priceType: 'free',
      price: 0,
      url: 'https://example.com/courses/python-data',
      rating: 4.8
    },
    {
      companyId: cloudSphereId,
      title: 'Cloud Infrastructure & Kubernetes Mastery',
      provider: 'CloudSphere University',
      description: 'Deploy fault-tolerant containerized applications using Kubernetes, Terraform, and AWS multi-zone clusters.',
      category: 'Cloud & Infrastructure',
      skillTags: 'Docker, Kubernetes, AWS / Cloud, Linux / Bash',
      level: 'advanced',
      duration: '10 Weeks',
      priceType: 'paid',
      price: 1999,
      url: 'https://example.com/courses/kubernetes-mastery',
      rating: 4.95
    },
    {
      companyId: null,
      title: 'Algorithms & Data Structures: Interview Bootcamp',
      provider: 'OpenTech Institute',
      description: 'Comprehensive preparation for technical coding interviews focusing on dynamic programming, trees, and graphs.',
      category: 'Software Engineering',
      skillTags: 'Data Structures & Algorithms, Java, C++, Python',
      level: 'intermediate',
      duration: '6 Weeks',
      priceType: 'free',
      price: 0,
      url: 'https://example.com/courses/dsa-bootcamp',
      rating: 4.85
    },
    {
      companyId: techNovaId,
      title: 'Applied Machine Learning and Deep Learning Foundations',
      provider: 'TechNova AI Research',
      description: 'Deep dive into PyTorch, supervised algorithms, feature engineering, and neural network tuning.',
      category: 'Artificial Intelligence',
      skillTags: 'Python, Machine Learning, Deep Learning',
      level: 'advanced',
      duration: '12 Weeks',
      priceType: 'paid',
      price: 2499,
      url: 'https://example.com/courses/ai-ml',
      rating: 4.9
    },
    {
      companyId: null,
      title: 'Foundations of Cyber Defense & Ethical Hacking',
      provider: 'CyberGuard Alliance',
      description: 'Understand vulnerability assessments, penetration testing techniques, cryptographic protocols, and incident containment.',
      category: 'Security',
      skillTags: 'Cybersecurity, Linux / Bash, Problem Solving',
      level: 'intermediate',
      duration: '8 Weeks',
      priceType: 'free',
      price: 0,
      url: 'https://example.com/courses/cyber-defense',
      rating: 4.75
    }
  ];

  for (const crs of coursesData) {
    await execute(
      `INSERT INTO courses (posted_by_company_id, title, provider, description, category, skill_tags, level, duration, price_type, price, course_url, rating, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [crs.companyId, crs.title, crs.provider, crs.description, crs.category, crs.skillTags, crs.level, crs.duration, crs.priceType, crs.price, crs.url, crs.rating]
    );
  }

  // 7. Jobs Marketplace
  const jobsData = [
    {
      companyId: techNovaId,
      title: 'Junior Full Stack Engineer',
      description: 'Join our flagship cloud modernization team building high-performance microservices and intuitive React dashboards. You will write TypeScript across the stack, build clean REST endpoints, and participate in peer code reviews.',
      location: 'Bangalore, India',
      workMode: 'hybrid',
      salMin: 800000,
      salMax: 1200000,
      exp: '0-2 Years (Fresher / Junior)',
      degree: 'B.Tech / B.E. / M.C.A.',
      branch: 'Computer Science, IT, ECE',
      skills: 'React, TypeScript, Node.js, SQL, Git & GitHub',
      deadline: '2026-12-31'
    },
    {
      companyId: techNovaId,
      title: 'Associate Cloud Software Engineer',
      description: 'Design and deploy scalable serverless backend applications, build integration pipelines with AWS services, and write clean maintainable Node.js & Go code.',
      location: 'Remote / Bangalore',
      workMode: 'remote',
      salMin: 900000,
      salMax: 1400000,
      exp: '1-3 Years',
      degree: 'B.Tech / B.E.',
      branch: 'Any Engineering',
      skills: 'Node.js, Docker, AWS / Cloud, Git & GitHub, Problem Solving',
      deadline: '2026-11-30'
    },
    {
      companyId: nextGenId,
      title: 'Graduate Data Analyst',
      description: 'Work alongside senior data scientists to parse enterprise metrics, create executive Tableau dashboards, and streamline SQL reporting pipelines for our commerce partners.',
      location: 'Hyderabad, India',
      workMode: 'onsite',
      salMin: 650000,
      salMax: 1000000,
      exp: '0-1 Years (Fresher)',
      degree: 'B.Tech / B.Sc / BCA / MCA',
      branch: 'CS, IT, Data Science, Statistics',
      skills: 'SQL, Python, Tableau / PowerBI, Communication',
      deadline: '2026-10-31'
    },
    {
      companyId: cloudSphereId,
      title: 'Junior DevOps / Infrastructure Engineer',
      description: 'Automate build and deployment pipelines, maintain Kubernetes cluster health, implement monitoring dashboards with Prometheus, and write infrastructure-as-code.',
      location: 'Pune, India',
      workMode: 'hybrid',
      salMin: 850000,
      salMax: 1300000,
      exp: '0-2 Years',
      degree: 'B.Tech / B.E.',
      branch: 'Computer Science / IT',
      skills: 'Docker, Kubernetes, Linux / Bash, Git & GitHub, DevOps & CI/CD',
      deadline: '2026-12-15'
    }
  ];

  const jobIdList: number[] = [];
  for (const j of jobsData) {
    const res = await execute(
      `INSERT INTO jobs (company_id, title, description, location, work_mode, salary_min, salary_max, salary_currency, experience_level, required_degree, required_branch, required_skills, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, 'published')`,
      [j.companyId, j.title, j.description, j.location, j.workMode, j.salMin, j.salMax, j.exp, j.degree, j.branch, j.skills, j.deadline]
    );
    jobIdList.push(res.insertId);
  }

  // 8. Internships
  const internshipsData = [
    {
      companyId: techNovaId,
      title: 'Full Stack Development Intern',
      description: '6-month immersive internship with hands-on feature development in React, TypeScript, and Express. Mentorship by senior architects with high PPO conversion potential.',
      duration: '6 Months',
      location: 'Bangalore, India',
      workMode: 'hybrid',
      stipend: '₹35,000 / month',
      skills: 'React, JavaScript, Node.js, Git & GitHub',
      eligibility: 'Pre-final & Final year B.Tech / MCA students with min 7.5 CGPA',
      deadline: '2026-10-15'
    },
    {
      companyId: nextGenId,
      title: 'Data Science & Machine Learning Intern',
      description: 'Assist in training exploratory predictive models, evaluating feature correlations, and automating ETL cleaning pipelines.',
      duration: '3 Months',
      location: 'Hyderabad, India',
      workMode: 'remote',
      stipend: '₹30,000 / month',
      skills: 'Python, Machine Learning, SQL',
      eligibility: '3rd or 4th year students with strong statistical foundation',
      deadline: '2026-11-01'
    },
    {
      companyId: cloudSphereId,
      title: 'Cloud Engineering Intern',
      description: 'Learn enterprise AWS architectures, Docker containerization, and automation scripts under dedicated guidance.',
      duration: '6 Months',
      location: 'Pune / Remote',
      workMode: 'remote',
      stipend: '₹28,000 / month',
      skills: 'Linux / Bash, Docker, AWS / Cloud, Git & GitHub',
      eligibility: 'Passionate self-starters with familiarity in Linux command line',
      deadline: '2026-10-30'
    }
  ];

  const internshipIdList: number[] = [];
  for (const i of internshipsData) {
    const res = await execute(
      `INSERT INTO internships (company_id, title, description, duration, location, work_mode, stipend, skills, eligibility, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [i.companyId, i.title, i.description, i.duration, i.location, i.workMode, i.stipend, i.skills, i.eligibility, i.deadline]
    );
    internshipIdList.push(res.insertId);
  }

  // 9. Campus / Recruitment Drives
  const drivesData = [
    {
      companyId: techNovaId,
      title: 'TechNova Annual Campus Placement Drive 2025-26',
      description: 'Mass campus recruitment drive for Software Engineers, Full Stack Developers, and QA Automation Specialists. Includes online coding challenge, technical rounds, and leadership HR discussion.',
      driveDate: '2026-10-20',
      venue: 'Main Campus Auditorium / Virtual Hackathon Link',
      eligibility: 'B.Tech / B.E. (CSE, IT, ECE) with minimum 7.50 CGPA. No active backlogs.',
      minCgpa: 7.50,
      degree: 'B.Tech / B.E.',
      branch: 'Computer Science, Information Technology, Electronics',
      skills: 'Data Structures & Algorithms, Java or Python or JavaScript, SQL, Problem Solving',
      process: '1. Online Coding Round (90 mins) -> 2. Technical Interview 1 -> 3. Technical Interview 2 -> 4. HR Fitment',
      deadline: '2026-10-10'
    },
    {
      companyId: nextGenId,
      title: 'NextGen Analytics Campus Hiring Challenge',
      description: 'Exclusive hiring sprint for aspiring Data Analysts, BI Developers, and Associate Data Scientists.',
      driveDate: '2026-11-05',
      venue: 'Online Assessment Platform + Video Rounds',
      eligibility: 'B.Tech / B.Sc / MCA with minimum 7.00 CGPA.',
      minCgpa: 7.00,
      degree: 'B.Tech / B.E. / MCA',
      branch: 'All Branches welcome with strong analytical skills',
      skills: 'SQL, Python, Analytical Problem Solving',
      process: 'Aptitude & SQL Test -> Technical Deep Dive -> HR Offer Discussion',
      deadline: '2026-10-25'
    }
  ];

  const driveIdList: number[] = [];
  for (const d of drivesData) {
    const res = await execute(
      `INSERT INTO recruitment_drives (company_id, title, description, drive_date, venue_or_link, eligibility, min_cgpa, required_degree, required_branch, required_skills, selection_process, application_deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [d.companyId, d.title, d.description, d.driveDate, d.venue, d.eligibility, d.minCgpa, d.degree, d.branch, d.skills, d.process, d.deadline]
    );
    driveIdList.push(res.insertId);
  }

  // 10. Demo Student Applications (Diverse Statuses for realistic visual timeline)
  // Alex applied to TechNova Junior Full Stack Engineer -> Interview stage!
  await execute(
    `INSERT INTO applications (student_id, item_type, item_id, status, notes, timeline_events_json)
     VALUES (?, 'job', ?, 'interview', 'Technical round scheduled for next Tuesday at 3:00 PM.', ?)`,
    [
      alexStudentId,
      jobIdList[0],
      JSON.stringify([
        { status: 'applied', date: '2026-09-01T10:00:00Z', note: 'Application submitted via AI portal' },
        { status: 'under_review', date: '2026-09-03T14:30:00Z', note: 'Profile screened and marked eligible by Recruiter' },
        { status: 'shortlisted', date: '2026-09-06T09:15:00Z', note: 'Shortlisted based on strong React & TypeScript match' },
        { status: 'interview', date: '2026-09-10T11:00:00Z', note: 'Technical Interview invitation dispatched' }
      ])
    ]
  );

  // Alex applied to TechNova Internship -> Selected!
  await execute(
    `INSERT INTO applications (student_id, item_type, item_id, status, notes, timeline_events_json)
     VALUES (?, 'internship', ?, 'selected', 'Congratulations! Formal internship offer extended.', ?)`,
    [
      alexStudentId,
      internshipIdList[0],
      JSON.stringify([
        { status: 'applied', date: '2026-08-15T08:00:00Z', note: 'Applied' },
        { status: 'under_review', date: '2026-08-18T10:00:00Z', note: 'Resume Review' },
        { status: 'shortlisted', date: '2026-08-20T12:00:00Z', note: 'Shortlisted' },
        { status: 'interview', date: '2026-08-25T14:00:00Z', note: 'Completed Technical Chat' },
        { status: 'selected', date: '2026-09-02T16:00:00Z', note: 'Offer letter generated' }
      ])
    ]
  );

  // Alex applied to TechNova Campus Drive -> Applied
  await execute(
    `INSERT INTO applications (student_id, item_type, item_id, status, notes, timeline_events_json)
     VALUES (?, 'drive', ?, 'applied', 'Registration confirmed. Hall ticket will be generated 48 hours before the drive.', ?)`,
    [
      alexStudentId,
      driveIdList[0],
      JSON.stringify([
        { status: 'applied', date: '2026-09-12T09:00:00Z', note: 'Registered for campus drive' }
      ])
    ]
  );

  // Peer 1 (Aarav) applied to NextGen Graduate Data Analyst -> Shortlisted
  await execute(
    `INSERT INTO applications (student_id, item_type, item_id, status, notes, timeline_events_json)
     VALUES (?, 'job', ?, 'shortlisted', 'Profile screened with high SQL match.', ?)`,
    [
      aaravRes.insertId,
      jobIdList[2],
      JSON.stringify([
        { status: 'applied', date: '2026-09-08T11:00:00Z', note: 'Applied' },
        { status: 'under_review', date: '2026-09-09T14:00:00Z', note: 'Review' },
        { status: 'shortlisted', date: '2026-09-11T10:00:00Z', note: 'Shortlisted' }
      ])
    ]
  );

  // 11. Bookmarks for Alex
  if (jobIdList[1]) {
    await execute(
      `INSERT INTO bookmarks (student_id, item_type, item_id) VALUES (?, 'job', ?)`,
      [alexStudentId, jobIdList[1]]
    );
  }
  await execute(
    `INSERT INTO bookmarks (student_id, item_type, item_id) VALUES (?, 'course', 1)`,
    [alexStudentId]
  );

  // 12. Personalized Roadmap for Alex (Target: Full Stack Developer)
  const fsCareerId = careerIdMap['Full Stack Developer'];
  if (fsCareerId) {
    const roadmapRes = await execute(
      `INSERT INTO roadmaps (student_id, career_id, title, target_role, total_stages, completed_stages)
       VALUES (?, ?, ?, ?, 6, 2)`,
      [alexStudentId, fsCareerId, 'Full Stack Mastery Roadmap', 'Full Stack Developer']
    );
    const roadmapId = roadmapRes.insertId;

    const stages = [
      {
        num: 1,
        title: 'Stage 1 — Fundamentals',
        desc: 'Core computer science fundamentals, HTTP protocols, DOM mechanics, and asynchronous JavaScript.',
        skills: JSON.stringify(['JavaScript', 'HTML5', 'CSS3', 'Git & GitHub']),
        resources: JSON.stringify(['MDN Web Docs', 'JavaScript.info', 'Git Handbook']),
        duration: '3 Weeks',
        completed: 1
      },
      {
        num: 2,
        title: 'Stage 2 — Core Frontend & Backend',
        desc: 'Component architecture with React & TypeScript, modular server creation with Express and relational databases.',
        skills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'SQL', 'PostgreSQL / MySQL']),
        resources: JSON.stringify(['Official React Docs', 'TypeScript in 50 Lessons', 'Pragmatic Node.js Guide']),
        duration: '5 Weeks',
        completed: 1
      },
      {
        num: 3,
        title: 'Stage 3 — Advanced Skills & Architecture',
        desc: 'State management, caching strategies (Redis), containerization with Docker, and automated integration testing.',
        skills: JSON.stringify(['Docker', 'REST & GraphQL APIs', 'Caching', 'Data Structures & Algorithms']),
        resources: JSON.stringify(['Docker Deep Dive', 'System Design Primer']),
        duration: '4 Weeks',
        completed: 0
      },
      {
        num: 4,
        title: 'Stage 4 — Production Projects',
        desc: 'Construct and deploy a real-time collaborative application featuring WebSockets, role-based auth, and CI/CD pipelines.',
        skills: JSON.stringify(['System Design', 'DevOps & CI/CD', 'AWS / Cloud']),
        resources: JSON.stringify(['GitHub Actions CI/CD Mastery', 'Full Stack Capstone Guide']),
        duration: '4 Weeks',
        completed: 0
      },
      {
        num: 5,
        title: 'Stage 5 — Technical Interview Preparation',
        desc: 'Solve medium/hard data structures, mock behavioral scenarios (STAR method), and practice low-level system design.',
        skills: JSON.stringify(['Problem Solving', 'Communication', 'System Design']),
        resources: JSON.stringify(['LeetCode Top 150', 'Grokking the System Design Interview']),
        duration: '3 Weeks',
        completed: 0
      },
      {
        num: 6,
        title: 'Stage 6 — Job Readiness & Industry Polish',
        desc: 'Portfolio curation, resume tailoring with metric-driven impact bullets, mock HR interviews, and salary negotiation.',
        skills: JSON.stringify(['Leadership', 'Teamwork & Collaboration', 'Communication']),
        resources: JSON.stringify(['Resume Crafting Checklist', 'Tech Career Negotiation Handbook']),
        duration: '2 Weeks',
        completed: 0
      }
    ];

    for (const st of stages) {
      await execute(
        `INSERT INTO roadmap_items (roadmap_id, stage_number, stage_title, description, skills_json, resources_json, estimated_duration, is_completed, completed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [roadmapId, st.num, st.title, st.desc, st.skills, st.resources, st.duration, st.completed, st.completed ? '2026-08-30' : null]
      );
    }
  }

  // 13. AI Advisor Initial Chat Session for Alex
  const chatRes = await execute(
    `INSERT INTO chat_sessions (student_id, title) VALUES (?, ?)`,
    [alexStudentId, 'Career Strategy & Interview Readiness']
  );
  const sessionId = chatRes.insertId;

  await execute(
    `INSERT INTO chat_messages (session_id, sender, message, suggested_prompts_json)
     VALUES (?, 'assistant', ?, ?)`,
    [
      sessionId,
      `Hello Alex! 👋 I'm your AI Career Advisor. I've reviewed your profile—your strong grasp of React, TypeScript, and 8.65 CGPA in Computer Science positions you exceptionally well for Full Stack and Software Engineering roles.\n\nHow would you like to level up today?`,
      JSON.stringify([
        'What career suits me best?',
        'What skills should I learn next?',
        'How can I become a data analyst?',
        'Which skills am I missing for Cloud Engineer?',
        'Help me prepare for an interview.'
      ])
    ]
  );

  // 14. Notifications for Alex, Recruiter, and Admin
  // Student notification
  await execute(
    `INSERT INTO notifications (user_id, title, message, type, is_read, link)
     VALUES (?, ?, ?, 'application', 0, '/student/applications')`,
    [
      studentUserId,
      'Application Status Updated: Interview Scheduled',
      'TechNova Solutions has invited you for a Technical Interview for the Junior Full Stack Engineer position.',
    ]
  );
  await execute(
    `INSERT INTO notifications (user_id, title, message, type, is_read, link)
     VALUES (?, ?, ?, 'match', 0, '/student/drives')`,
    [
      studentUserId,
      'New Campus Drive Announced',
      'TechNova Annual Campus Placement Drive is scheduled for October 20, 2026. You meet all eligibility criteria!',
    ]
  );

  // Recruiter notification
  await execute(
    `INSERT INTO notifications (user_id, title, message, type, is_read, link)
     VALUES (?, ?, ?, 'application', 0, '/recruiter/applications')`,
    [
      recruiterUserId,
      'New Applicant Received',
      'Alex Mercer applied for Junior Full Stack Engineer (85% skill match).',
    ]
  );

  // Admin notification
  await execute(
    `INSERT INTO notifications (user_id, title, message, type, is_read, link)
     VALUES (?, ?, ?, 'admin', 0, '/admin/organizations')`,
    [
      adminUserId,
      'New Organization Awaiting Verification',
      'FutureStack Innovations has registered and submitted credentials for admin approval.',
    ]
  );

  console.log('✅ Demo Data Seeded Successfully!');
  console.log('==============================================');
  console.log('Demo Credentials:');
  console.log('👨‍🎓 Student:   student@demo.com   / Student@123');
  console.log('🏢 Recruiter: recruiter@demo.com / Recruiter@123');
  console.log('🛡️ Admin:     admin@demo.com     / Admin@123');
  console.log('==============================================');
}

// Run immediately if invoked directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
