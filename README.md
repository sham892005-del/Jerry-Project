# AI-Assisted Career Guidance System

> **A Comprehensive Full-Stack Engineering Capstone Platform**  
> Built with React 18, TypeScript, Tailwind CSS, Node.js/Express, Dual MySQL/SQLite Database, Role-Based Access Control, and Intelligent AI Career Trajectory Recommendation & Skill Gap Engines.

---

## 🌟 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Capabilities & Innovations](#-key-capabilities--innovations)
3. [Three-Tier Role Separation](#-three-tier-role-separation)
4. [System Architecture](#-system-architecture)
5. [Database Architecture & Entities](#-database-architecture--entities)
6. [AI Recommendation & Reasoning Engine](#-ai-recommendation--reasoning-engine)
7. [Demo Accounts & Credentials](#-demo-accounts--credentials)
8. [Quick Start & Installation](#-quick-start--installation)
9. [REST API Documentation](#-rest-api-documentation)
10. [Security & Privacy Enforcement](#-security--privacy-enforcement)
11. [Project Viva & Defense Guide](#-project-viva--defense-guide)

---

## 🎯 Project Overview

The **AI-Assisted Career Guidance System** bridges the critical gap between academic curriculum, individual student competency profiles, and contemporary industry hiring standards. Rather than providing static job boards or superficial quiz templates, the platform implements an **integrated career ecosystem** that:

* Continuously evaluates student academic backgrounds, programming proficiencies, tools, and career goals.
* Computes weighted **AI Career Match Scores** against industry benchmark career pathways.
* Conducts real-time **Skill-Gap Analysis** showing required vs. candidate proficiencies.
* Generates milestone-driven **Personalized Learning Roadmaps** with database-persisted progress tracking.
* Connects students to verified opportunities across **Sponsored Courses, Full-time Jobs, Internships, and Campus Recruitment Drives**.
* Enforces strict **Candidate Privacy Controls** allowing students to hide sensitive academic or contact info from recruiters.
* Equips hiring partners with a visual **Hiring Pipeline Kanban**, candidate search, and talent analytics.
* Provides institutional administrators with comprehensive **Organization Vetting, Content Moderation, and Demo Data Management**.

---

## 🚀 Key Capabilities & Innovations

### 1. Multi-Dimensional AI Career Recommendations
* **Weighted Multi-Factor Formula**: Evaluates required skill overlaps (45%), proficiency depth (25%), degree & branch relevance (15%), academic CGPA alignment (10%), and declared career aspirations (5%).
* **Deterministic Baseline + Gemini LLM**: Operates with 100% functionality out-of-the-box using the algorithmic engine. When a Google Gemini API Key (`GEMINI_API_KEY`) is configured, responses are enhanced with natural language advisory commentary.

### 2. Interactive Skill-Gap Analysis & Diagnostics
* Comparative readiness diagnostics for each career path.
* Visual proficiency comparison (`Current vs. Target`) across Core, Secondary, and Emerging competencies.
* Dynamically highlights priority focus areas required to close the gap.

### 3. Personalized Learning Roadmap
* Six structured developmental milestones:
  1. *Fundamentals & Core CS Theory*
  2. *Core Competencies & Frameworks*
  3. *Advanced Engineering & Cloud*
  4. *Portfolio Projects & System Architecture*
  5. *Interview Readiness & Coding Tests*
  6. *Job Application & Workplace Onboarding*
* Checkpoint task toggling persisted directly in the relational database.

### 4. Real-Time Eligibility Verification
* When a student applies for a Campus Recruitment Drive, the backend automatically validates their actual profile CGPA, branch, and degree against the drive's cutoff criteria rather than trusting client-side claims.

### 5. Candidate Privacy by Design
* Configurable student privacy controls (`show_cgpa`, `show_email`, `show_phone`, `show_skills`, `show_career_goal`).
* Privacy masking is enforced **at the database query layer**, ensuring unpermitted fields never leave the server over API responses.

### 6. Corporate Recruitment Suite & Kanban Pipeline
* Visual pipeline stages: `Applied` ➔ `Screening / Under Review` ➔ `Shortlisted` ➔ `Interview Scheduled` ➔ `Selected / Offer Extended` or `Rejected`.
* Transition notes trigger automated student in-app notifications and timeline records.

### 7. Dual Database Engine (MySQL + SQLite Wasm)
* Production support for standard MySQL 8.x.
* Automatic, zero-configuration fallback to an embedded pure WebAssembly SQLite database (`sql.js`) with disk persistence to `server/data/career_guidance.db` if MySQL is inactive.

---

## 🛡️ Three-Tier Role Separation

The platform enforces **strict role segregation** at both the React Router guard level and Express JWT middleware level:

| Role | Allowed URL Scope | Unauthorized Scopes | Portal Dashboard |
| :--- | :--- | :--- | :--- |
| **Student** | `/student/*` | `/recruiter/*`, `/admin/*` | `/student/dashboard` |
| **Recruiter** | `/recruiter/*` | `/student/*`, `/admin/*` | `/recruiter/dashboard` or `/recruiter/pending` |
| **Admin** | `/admin/*` | N/A (Admin governance) | `/admin/dashboard` |

> ⚠️ Any unauthorized request attempting to cross roles receives an immediate `HTTP 403 Forbidden` from the backend API and is redirected to `/unauthorized`.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Modern React 18 Single-Page App          │
│  (Tailwind CSS, Lucide Icons, Recharts, React Router)  │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTP / REST API (JWT Bearer)
┌──────────────────────────▼─────────────────────────────┐
│                 Node.js / Express Server               │
│  ├── Authentication & Role Middleware                  │
│  ├── Controllers (Student, Recruiter, Admin, Auth)     │
│  ├── Gemini & Heuristic AI Engine                      │
│  └── Privacy & Validation Guards                       │
└──────────────────────────┬─────────────────────────────┘
                           │ SQL Abstraction Layer
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐
│ MySQL 8.x DB     │ (Production)  │ SQLite (sql.js)  │ (Zero-Setup Fallback)
│ localhost:3306   │               │ career_guidance  │
└──────────────────┘               └──────────────────┘
```

---

## 🗄️ Database Architecture & Entities

The system implements a normalized 24-entity relational schema:

1. **`users`**: Central authentication table (`email`, `password_hash`, `role`, `is_active`).
2. **`students`**: Academic profile (`full_name`, `degree`, `branch`, `graduation_year`, `college`, `cgpa`, `phone`).
3. **`student_profiles`**: Career aspirations (`bio`, `career_goal`, `preferred_job_role`, `preferred_location`, `completion_percentage`).
4. **`skills`**: Master taxonomy of programming languages, frameworks, libraries, tools, and soft skills.
5. **`student_skills`**: Many-to-many relationship mapping student competencies with proficiency ratings (1-100%).
6. **`student_interests`**: Student domain preferences (e.g., AI/ML, Cloud Computing, Cybersecurity).
7. **`privacy_settings`**: Granular candidate visibility toggles.
8. **`companies`**: Organization accounts with verification statuses (`pending`, `approved`, `rejected`).
9. **`company_profiles`**: Corporate branding, tech stacks, perks, and contact details.
10. **`careers`**: Industry career trajectory templates with descriptions and salary benchmarks.
11. **`career_skills`**: Target skill matrices with importance weights (Core, Recommended, Optional).
12. **`courses`**: Certified learning modules and external tracks.
13. **`jobs`**: Full-time and junior engineering openings with salary brackets and degree requirements.
14. **`internships`**: Collegiate internship opportunities with monthly stipends and duration details.
15. **`recruitment_drives`**: Campus hiring events with date, venue, minimum CGPA, and branch criteria.
16. **`applications`**: Candidate submissions across jobs, internships, and drives with status and timeline history.
17. **`bookmarks`**: Persisted saved opportunities.
18. **`roadmaps`**: Career learning roadmaps assigned to students.
19. **`roadmap_items`**: Checkpoint tasks with status toggles.
20. **`chat_sessions`**: Chatbot consultation sessions.
21. **`chat_messages`**: Chat history with prompt recommendations and source labels.
22. **`notifications`**: In-app notifications with read tracking.
23. **`admin_actions`**: Institutional audit trail logs.
24. **`reports`**: User and posting flags.

---

## 🤖 AI Recommendation & Reasoning Engine

Located in [`server/src/services/ai.service.ts`](file:///d:/Jerry%20project/server/src/services/ai.service.ts):

### Match Score Computation Formula
$$\text{Match Score} = (S_{\text{overlap}} \times 0.45) + (S_{\text{prof}} \times 0.25) + (S_{\text{deg}} \times 0.15) + (S_{\text{cgpa}} \times 0.10) + (S_{\text{goal}} \times 0.05)$$

* **Skill Overlap ($S_{\text{overlap}}$)**: Ratio of required career skills mastered by candidate.
* **Skill Proficiency ($S_{\text{prof}}$)**: Average depth of verified candidate skills.
* **Degree Relevance ($S_{\text{deg}}$)**: Semantic alignment between candidate degree/branch and target role.
* **CGPA Alignment ($S_{\text{cgpa}}$)**: Scaled score relative to typical industry screening cutoffs.
* **Goal Alignment ($S_{\text{goal}}$)**: Keyword similarity between stated career objective and career title.

---

## 🔑 Demo Accounts & Credentials

The application is pre-seeded with realistic fictional corporate entities (*TechNova Solutions*, *CloudSphere Technologies*, *NextGen Analytics*, *FutureStack Innovations*):

| Portal | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@demo.com` | `Student@123` | `student` | Verified Computer Science undergraduate with active applications & roadmap |
| **Recruiter** | `recruiter@demo.com` | `Recruiter@123` | `recruiter` | Approved corporate recruiter at TechNova Solutions |
| **Admin** | `admin@demo.com` | `Admin@123` | `admin` | Institutional platform governor |

---

## 💻 Quick Start & Installation

### Prerequisites
* **Node.js** v18.0 or higher (v20+ / v24+ supported)
* **npm** v9.0 or higher
* *(Optional)* MySQL 8.x Server

### Step 1: Clone or Navigate to Directory
```bash
cd "d:/Jerry project"
```

### Step 2: Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` in the root and `server/` directory:
```bash
cp .env.example .env
cp .env.example server/.env
```

### Step 4: Seed the Database
Populate all 24 normalized tables with realistic demo entities:
```bash
npm run seed
```

### Step 5: Launch the Application
Start both the Express backend API (`:5000`) and the Vite React frontend (`:5173`):
```bash
npm run dev
```

* **Frontend Application**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000`
* **API Health Status**: `http://localhost:5000/api/health`

### Production Build & Single-Port Launch
```bash
# Builds server and client dist bundles
npm run build

# Runs production server serving client SPA on http://localhost:5000
npm start
```

---

## 📋 REST API Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/student/register` — Student account registration
* `POST /api/auth/student/login` — Student authentication
* `POST /api/auth/recruiter/register` — Recruiter registration (`status: pending`)
* `POST /api/auth/recruiter/login` — Recruiter authentication
* `POST /api/auth/admin/login` — Administrative authentication
* `GET /api/auth/me` — Authenticated user token verification

### Student Portal (`/api/student`)
* `GET /api/student/dashboard` — Aggregated metrics, applications, and saved tracks
* `GET /api/student/profile` — Full profile with skills, interests, and privacy settings
* `PUT /api/student/profile` — Update academic details
* `PUT /api/student/profile/skills` — Update skill ratings
* `PUT /api/student/profile/privacy` — Configure recruiter visibility settings
* `GET /api/student/recommendations` — AI multi-factor career matches
* `GET /api/student/skill-gap/:careerId` — Diagnostic skill comparison
* `GET /api/student/roadmap` — Learning roadmap checkpoints
* `PATCH /api/student/roadmap/stage/:itemId` — Toggle task milestone
* `GET /api/student/jobs` — Browse jobs with keyword and mode filters
* `GET /api/student/internships` — Browse internships
* `GET /api/student/drives` — Campus recruitment drives with eligibility indicators
* `POST /api/student/apply` — Submit application with automatic eligibility verification
* `GET /api/student/applications` — Application pipeline history and timeline
* `POST /api/student/bookmarks/toggle` — Save/unsave opportunities
* `POST /api/student/chat/message` — Interact with AI Career Advisor

### Recruiter Portal (`/api/recruiter`)
* `GET /api/recruiter/dashboard` — Job openings, applicant metrics, and pipeline count
* `GET /api/recruiter/applications` — Applications for firm's postings (respects candidate privacy)
* `PATCH /api/recruiter/applications/:id/status` — Transition applicant stage with note
* `GET /api/recruiter/students` — Talent search with degree, branch, CGPA, and skill filters
* `POST /api/recruiter/students/:id/invite` — Send direct candidate invitations
* `GET /api/recruiter/jobs`, `POST`, `PUT`, `DELETE` — Opportunity CRUD
* `GET /api/recruiter/internships`, `POST`, `PUT`, `DELETE` — Internship CRUD
* `GET /api/recruiter/courses`, `POST`, `PUT`, `DELETE` — Course CRUD
* `GET /api/recruiter/drives`, `POST`, `PUT`, `DELETE` — Campus drive CRUD
* `GET /api/recruiter/analytics` — Talent demographics and conversion rate charts

### Admin Portal (`/api/admin`)
* `GET /api/admin/dashboard` — Institutional metrics and pending partner queue
* `GET /api/admin/students` — Student directory with profile completion meters
* `PATCH /api/admin/students/:id/toggle-active` — Activate or deactivate student account
* `GET /api/admin/organizations` — Corporate directory with approval statuses
* `PATCH /api/admin/organizations/:id/approve` — Approve pending partner
* `PATCH /api/admin/organizations/:id/reject` — Reject registration with reason
* `GET /api/admin/moderation` — Content moderation queue for opportunities
* `POST /api/admin/moderation/action` — Approve, reject, or close postings
* `GET /api/admin/analytics` — Enrollment distributions and conversion funnels
* `POST /api/admin/demo-data/seed` — 1-click database reset and re-seed

---

## 🔒 Security & Privacy Enforcement

1. **Password Hashing**: `bcryptjs` with salt factor 10.
2. **Cryptographic Tokens**: Signed JWTs with standard expiration periods.
3. **Database Parameterization**: All SQL queries utilize parameterized placeholders (`?`) preventing SQL injection.
4. **Backend Privacy Shield**: Unpermitted student fields are stripped on the server before JSON serialization:
   ```typescript
   cgpa: s.show_cgpa ? s.cgpa : null,
   email: s.show_email ? s.email : null,
   phone: s.show_phone ? s.phone : null
   ```
5. **Organizational Gatekeeping**: Unapproved companies cannot publish opportunities (`requireApprovedCompany` middleware).

---

## 🎓 Project Viva & Defense Guide

### Core Talking Points for Evaluators:
1. **Problem Statement**: Standard campus placements lack proactive guidance, while commercial job boards ignore academic milestones. This system integrates career recommendations, skill gap closing, and direct campus recruiting into one verified institutional platform.
2. **Deterministic Fallback**: Explain that AI reliability in educational systems requires predictability. The platform uses a weighted heuristic algorithm that guarantees robust, explainable match percentages even without cloud API dependencies.
3. **Candidate Privacy**: Highlight that students control their data visibility (e.g. CGPA, phone) and that privacy is enforced at the database query level rather than just hiding DOM elements in CSS.
4. **Architectural Discipline**: Emphasize strict role separation: 3 completely isolated user journeys with distinct URL hierarchies, layout shells, route guards, and server-side JWT verification.

---

### Project Complete & Ready for Review
* **License**: MIT
* **Academic Year**: 2025–2026 Final-Year Engineering Project Demonstration
