import dotenv from 'dotenv';
import { query, queryOne } from '../database/db';

dotenv.config();

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

export class AIService {
  private static geminiApiKey = process.env.GEMINI_API_KEY || '';

  public static isGeminiConfigured(): boolean {
    return Boolean(this.geminiApiKey && this.geminiApiKey.trim().length > 10);
  }

  /**
   * Recommend top 5 careers based on student's full profile
   */
  public static async getCareerRecommendations(studentId: number): Promise<{
    provider: 'gemini' | 'deterministic-engine';
    recommendations: CareerRecommendation[];
  }> {
    // 1. Fetch student profile, education, skills, interests
    const student = await queryOne(
      `SELECT s.*, p.bio, p.career_goal, p.preferred_job_role, p.preferred_industry, p.preferred_location
       FROM students s
       LEFT JOIN student_profiles p ON p.student_id = s.id
       WHERE s.id = ?`,
      [studentId]
    );

    if (!student) {
      throw new Error('Student not found');
    }

    const studentSkills = await query(
      `SELECT ss.proficiency_level, ss.type, sk.name, sk.category
       FROM student_skills ss
       JOIN skills sk ON sk.id = ss.skill_id
       WHERE ss.student_id = ?`,
      [studentId]
    );

    const studentInterests = await query(
      `SELECT interest_name FROM student_interests WHERE student_id = ?`,
      [studentId]
    );

    const allCareers = await query(`SELECT * FROM careers`);
    const allCareerSkills = await query(
      `SELECT cs.*, sk.name as skill_name, sk.category as skill_category
       FROM career_skills cs
       JOIN skills sk ON sk.id = cs.skill_id`
    );

    // Map student skills for fast lookup
    const studentSkillMap = new Map<string, number>();
    studentSkills.forEach((s: any) => {
      studentSkillMap.set(s.name.toLowerCase().trim(), Number(s.proficiency_level) || 50);
    });

    const interestList = studentInterests.map((i: any) => i.interest_name.toLowerCase());
    const careerGoalText = (student.career_goal || '').toLowerCase();
    const preferredRoleText = (student.preferred_job_role || '').toLowerCase();
    const branchText = (student.branch || '').toLowerCase();

    // 2. Compute match for each career
    const scoredCareers: Array<{
      career: any;
      matchPercentage: number;
      matchedSkills: any[];
      missingSkills: any[];
      skillScore: number;
      academicScore: number;
      interestScore: number;
    }> = [];

    for (const career of allCareers) {
      const reqSkills = allCareerSkills.filter((cs: any) => cs.career_id === career.id);

      let totalSkillWeight = 0;
      let earnedSkillWeight = 0;
      const matchedSkills: any[] = [];
      const missingSkills: any[] = [];

      for (const cs of reqSkills) {
        const skillNameLower = cs.skill_name.toLowerCase().trim();
        const importanceWeight = cs.importance === 'required' ? 8 : 4;
        totalSkillWeight += importanceWeight;

        if (studentSkillMap.has(skillNameLower)) {
          const studentProf = studentSkillMap.get(skillNameLower)!;
          const targetProf = Number(cs.min_proficiency) || 70;
          const ratio = Math.min(studentProf / targetProf, 1.2);
          earnedSkillWeight += importanceWeight * Math.min(ratio, 1.0);

          matchedSkills.push({
            name: cs.skill_name,
            proficiency: studentProf,
            importance: cs.importance,
          });
        } else {
          missingSkills.push({
            name: cs.skill_name,
            requiredProficiency: cs.min_proficiency || 70,
            importance: cs.importance,
          });
        }
      }

      const skillScore = totalSkillWeight > 0 ? (earnedSkillWeight / totalSkillWeight) * 100 : 50;

      // Academic Alignment Score
      let academicScore = 70;
      const cCat = career.category.toLowerCase();
      const cTitle = career.title.toLowerCase();

      if (branchText.includes('computer') || branchText.includes('information') || branchText.includes('cs') || branchText.includes('it')) {
        academicScore = 95;
      } else if (branchText.includes('electronic') || branchText.includes('ece') || branchText.includes('electrical')) {
        if (cTitle.includes('network') || cTitle.includes('cloud') || cTitle.includes('software')) {
          academicScore = 88;
        } else {
          academicScore = 80;
        }
      } else if (cCat.includes('product') || cCat.includes('management') || cCat.includes('analytics')) {
        academicScore = 85;
      }

      // Interest & Goal Alignment Score
      let interestScore = 60;
      for (const interest of interestList) {
        if (cCat.includes(interest) || cTitle.includes(interest) || career.description.toLowerCase().includes(interest)) {
          interestScore += 12;
        }
      }
      if (careerGoalText && (cTitle.includes(careerGoalText) || careerGoalText.includes(cTitle))) {
        interestScore += 25;
      }
      if (preferredRoleText && (cTitle.includes(preferredRoleText) || preferredRoleText.includes(cTitle))) {
        interestScore += 20;
      }
      interestScore = Math.min(interestScore, 100);

      // Weighted Total: 55% Skills, 25% Academic, 20% Interests/Goals
      let compositeMatch = Math.round(skillScore * 0.55 + academicScore * 0.25 + interestScore * 0.20);
      compositeMatch = Math.max(15, Math.min(compositeMatch, 98));

      scoredCareers.push({
        career,
        matchPercentage: compositeMatch,
        matchedSkills,
        missingSkills,
        skillScore,
        academicScore,
        interestScore,
      });
    }

    // Sort descending and select top 5
    scoredCareers.sort((a, b) => b.matchPercentage - a.matchPercentage);
    const top5 = scoredCareers.slice(0, 5);

    // 3. Generate detailed reasoning and course mappings
    const recommendations: CareerRecommendation[] = [];

    for (const item of top5) {
      const matchedNames = item.matchedSkills.map((m: any) => m.name);
      const missingNames = item.missingSkills.map((m: any) => m.name);

      let reasoning = '';
      if (this.isGeminiConfigured()) {
        try {
          reasoning = await this.callGeminiForReasoning(student, item.career, item.matchedSkills, item.missingSkills);
        } catch (e) {
          reasoning = this.generateDeterministicReasoning(student, item.career, matchedNames, missingNames, item.matchPercentage);
        }
      } else {
        reasoning = this.generateDeterministicReasoning(student, item.career, matchedNames, missingNames, item.matchPercentage);
      }

      const suggestedNextSteps = [
        missingNames.length > 0
          ? `Upskill in high-priority missing competencies: ${missingNames.slice(0, 2).join(' and ')}.`
          : `Solidify your advanced portfolio with distributed architectural capstone projects.`,
        `Explore matching job openings and campus placement drives aligned with ${item.career.title}.`,
        `Complete targeted practice interview coding challenges in our personalized roadmap.`
      ];

      // Fetch recommended courses related to career category or missing skills
      const courses = await query(
        `SELECT id, title, provider, level, price_type FROM courses
         WHERE category LIKE ? OR skill_tags LIKE ? OR skill_tags LIKE ?
         LIMIT 2`,
        [`%${item.career.category}%`, `%${item.matchedSkills[0]?.name || ''}%`, `%${item.missingSkills[0]?.name || ''}%`]
      );

      recommendations.push({
        careerId: item.career.id,
        title: item.career.title,
        slug: item.career.slug,
        category: item.career.category,
        description: item.career.description,
        averageSalary: item.career.average_salary,
        growthRate: item.career.growth_rate,
        matchPercentage: item.matchPercentage,
        reasoning,
        matchedSkills: item.matchedSkills,
        missingSkills: item.missingSkills,
        suggestedNextSteps,
        recommendedCourses: courses.map((c: any) => ({
          id: c.id,
          title: c.title,
          provider: c.provider,
          level: c.level,
          priceType: c.price_type,
        }))
      });
    }

    return {
      provider: this.isGeminiConfigured() ? 'gemini' : 'deterministic-engine',
      recommendations,
    };
  }

  /**
   * Detailed Skill-Gap Analysis comparing a student against a specific career
   */
  public static async getSkillGapAnalysis(studentId: number, careerId: number): Promise<SkillGapReport> {
    const career = await queryOne('SELECT * FROM careers WHERE id = ?', [careerId]);
    if (!career) {
      throw new Error('Career not found');
    }

    const careerSkills = await query(
      `SELECT cs.*, sk.name as skill_name, sk.category as skill_category
       FROM career_skills cs
       JOIN skills sk ON sk.id = cs.skill_id
       WHERE cs.career_id = ?
       ORDER BY cs.importance DESC, cs.weight DESC`,
      [careerId]
    );

    const studentSkills = await query(
      `SELECT ss.proficiency_level, sk.name
       FROM student_skills ss
       JOIN skills sk ON sk.id = ss.skill_id
       WHERE ss.student_id = ?`,
      [studentId]
    );

    const studentMap = new Map<string, number>();
    studentSkills.forEach((s: any) => studentMap.set(s.name.toLowerCase().trim(), Number(s.proficiency_level) || 0));

    const skillItems: SkillGapItem[] = [];
    let totalTargetProficiency = 0;
    let totalCurrentProficiency = 0;
    let masteredCount = 0;
    const prioritySkills: string[] = [];

    for (const cs of careerSkills) {
      const name = cs.skill_name;
      const lowerName = name.toLowerCase().trim();
      const requiredProf = Number(cs.min_proficiency) || 70;
      const studentProf = studentMap.get(lowerName) || 0;
      const gap = Math.max(0, requiredProf - studentProf);

      totalTargetProficiency += requiredProf;
      totalCurrentProficiency += Math.min(studentProf, requiredProf);

      let status: 'mastered' | 'proficient' | 'developing' | 'missing' = 'missing';
      if (studentProf >= requiredProf) {
        status = 'mastered';
        masteredCount++;
      } else if (studentProf >= requiredProf * 0.7) {
        status = 'proficient';
      } else if (studentProf > 0) {
        status = 'developing';
      }

      if (gap > 0 && cs.importance === 'required') {
        prioritySkills.push(name);
      }

      skillItems.push({
        skillName: name,
        category: cs.skill_category,
        importance: cs.importance,
        studentProficiency: studentProf,
        requiredProficiency: requiredProf,
        gap,
        status,
      });
    }

    const readinessScore = totalTargetProficiency > 0
      ? Math.round((totalCurrentProficiency / totalTargetProficiency) * 100)
      : 50;

    let suggestedAction = '';
    if (readinessScore >= 80) {
      suggestedAction = `You are ready to apply for ${career.title} opportunities! Focus on interview practice and portfolio presentation.`;
    } else if (readinessScore >= 50) {
      suggestedAction = `Strong baseline demonstrated. Bridge your key missing skills (${prioritySkills.slice(0, 2).join(', ')}) through practical projects.`;
    } else {
      suggestedAction = `Begin with foundational training courses before advancing to complex architecture patterns.`;
    }

    return {
      careerId: career.id,
      careerTitle: career.title,
      readinessScore,
      totalRequiredSkills: careerSkills.length,
      masteredSkillsCount: masteredCount,
      skills: skillItems,
      prioritySkillsToLearn: prioritySkills.slice(0, 4),
      suggestedAction,
    };
  }

  /**
   * Context-Aware AI Career Advisor Chat
   */
  public static async generateAdvisorResponse(
    studentId: number,
    userMessage: string,
    chatHistory: Array<{ sender: string; message: string }>
  ): Promise<{ reply: string; suggestedPrompts: string[]; provider: 'gemini' | 'rule-engine' }> {
    const student = await queryOne(
      `SELECT s.*, p.bio, p.career_goal, p.preferred_job_role
       FROM students s
       LEFT JOIN student_profiles p ON p.student_id = s.id
       WHERE s.id = ?`,
      [studentId]
    );

    const studentSkills = await query(
      `SELECT sk.name, ss.proficiency_level, ss.type
       FROM student_skills ss
       JOIN skills sk ON sk.id = ss.skill_id
       WHERE ss.student_id = ?`,
      [studentId]
    );

    const skillsStr = studentSkills.map((s: any) => `${s.name} (${s.proficiency_level}%)`).join(', ');

    if (this.isGeminiConfigured()) {
      try {
        const geminiReply = await this.callGeminiChat(student, skillsStr, userMessage, chatHistory);
        return {
          reply: geminiReply,
          suggestedPrompts: [
            'How do I crack technical interviews for this role?',
            'What projects should I build next?',
            'Which certifications add value to my resume?',
            'Help me review my career trajectory.'
          ],
          provider: 'gemini',
        };
      } catch (err) {
        console.warn('Gemini chat call failed, falling back to local advisor:', err);
      }
    }

    // Local Intelligent Domain Rule-Engine Fallback
    const local = this.generateLocalAdvisorResponse(student, studentSkills, userMessage);
    return {
      reply: local.reply,
      suggestedPrompts: local.suggestedPrompts,
      provider: 'rule-engine',
    };
  }

  // --- Private Helpers ---

  private static generateDeterministicReasoning(
    student: any,
    career: any,
    matched: string[],
    missing: string[],
    matchPct: number
  ): string {
    const name = student.full_name.split(' ')[0];
    const branch = student.branch;

    if (matchPct >= 80) {
      return `${name}, your strong proficiency in ${matched.slice(0, 3).join(', ')} directly aligns with the technical demands of a ${career.title}. Combined with your ${student.cgpa} CGPA in ${branch}, you exhibit high domain readiness with only minimal gaps in ${missing.slice(0, 2).join(' and ') || 'advanced tools'}.`;
    } else if (matchPct >= 60) {
      return `Your academic training in ${branch} and established skill in ${matched.slice(0, 2).join(' and ') || 'core principles'} give you a solid foundation for ${career.title}. Elevating your competency in ${missing.slice(0, 2).join(', ')} will elevate your profile to top-candidate readiness.`;
    } else {
      return `While ${career.title} is an exciting career path, it requires dedicated upskilling in foundational areas like ${missing.slice(0, 3).join(', ')}. Your ${matched[0] || 'problem solving'} skill provides an initial anchor to build upon.`;
    }
  }

  private static generateLocalAdvisorResponse(
    student: any,
    skills: any[],
    queryText: string
  ): { reply: string; suggestedPrompts: string[] } {
    const q = queryText.toLowerCase();
    const studentName = student?.full_name?.split(' ')[0] || 'Student';
    const skillNames = skills.map((s: any) => s.name);

    if (q.includes('best') || q.includes('suit') || q.includes('which career')) {
      return {
        reply: `Based on your profile in ${student.branch} with a ${student.cgpa} CGPA and verified skills in ${skillNames.slice(0, 3).join(', ')}, you have a standout profile for **Full Stack Developer** and **Software Developer** roles!\n\nHere is why:\n1. Your programming foundation is well above the campus benchmark.\n2. Tech companies recruiting on our platform frequently look for candidates with your exact blend of frontend and database capabilities.\n\nWould you like to explore the personalized 6-stage roadmap for Full Stack Development?`,
        suggestedPrompts: [
          'Show me my Full Stack roadmap',
          'What skills should I learn next?',
          'How do I prepare for upcoming recruitment drives?'
        ]
      };
    }

    if (q.includes('learn next') || q.includes('missing') || q.includes('skills')) {
      return {
        reply: `Looking closely at top tech career requirements, your next highest-ROI skills to learn are:\n\n1. **Docker & Containerization**: Vital for deploying microservices and understanding DevOps workflows.\n2. **Cloud Architecture (AWS / GCP)**: Learn fundamental cloud primitives like S3, EC2, and Serverless Lambdas.\n3. **System Design Fundamentals**: Caching, database indexing, and REST API design patterns.\n\nCheck out the Course Discovery section where verified free courses for these topics are already cataloged!`,
        suggestedPrompts: [
          'Recommended courses for Docker',
          'Help me prepare for an interview',
          'What career suits me best?'
        ]
      };
    }

    if (q.includes('interview') || q.includes('prepare') || q.includes('crack')) {
      return {
        reply: `Here is a high-impact interview preparation strategy tailored for you, ${studentName}:\n\n- **Coding Rounds**: Practice Top 50 LeetCode patterns (Two Pointers, Sliding Window, Trees, and Dynamic Programming).\n- **Core Fundamentals**: Be ready to explain OOP concepts, database ACID properties, and the event loop in JavaScript/Node.js.\n- **Project Deep-Dive**: Recruiters will ask about architecture tradeoffs in your major projects. Be prepared to explain why you chose your tech stack and how you resolved bottlenecks.\n- **Behavioral**: Use the STAR method (Situation, Task, Action, Result) for teamwork and leadership questions.`,
        suggestedPrompts: [
          'What questions will recruiters ask about React?',
          'How can I improve my resume for campus placements?',
          'What skills should I learn next?'
        ]
      };
    }

    if (q.includes('data analyst') || q.includes('data scientist')) {
      return {
        reply: `Transitioning into a Data Analyst or Data Scientist trajectory is a great opportunity! With your quantitative engineering background:\n\n1. **Master SQL**: You will need complex aggregations, window functions, and subqueries.\n2. **Python Data Stack**: Deepen your hands-on work with Pandas, NumPy, and Matplotlib.\n3. **BI Dashboards**: Build 2-3 end-to-end Tableau or PowerBI dashboards highlighting business metrics.\n\nWe have open Junior Data Analyst positions from companies like NextGen Analytics currently active on the platform!`,
        suggestedPrompts: [
          'View Data Analyst jobs',
          'Compare my skills for Data Analyst',
          'What career suits me best?'
        ]
      };
    }

    // General default answer
    return {
      reply: `Hello ${studentName}! I have reviewed your current academic progress in ${student.branch} and your active profile.\n\nI can help you analyze your career options, identify specific skill gaps for target job openings, guide your interview preparation, or recommend top campus drives you are eligible for.\n\nWhat specific goal would you like to focus on right now?`,
      suggestedPrompts: [
        'What career suits me best?',
        'What skills should I learn next?',
        'Which recruitment drives am I eligible for?',
        'Help me prepare for an interview.'
      ]
    };
  }

  private static async callGeminiForReasoning(student: any, career: any, matched: any[], missing: any[]): Promise<string> {
    const prompt = `You are an expert career counselor evaluating a student for the career of "${career.title}".
Student Profile:
- Degree: ${student.degree} in ${student.branch}
- CGPA: ${student.cgpa}
- Current Skills: ${matched.map((m: any) => m.name).join(', ')}
- Missing Skills: ${missing.map((m: any) => m.name).join(', ')}

In 2-3 concise, encouraging, and professional sentences, explain why this career is a strong match for the student and what key areas they should focus on next. Avoid generic boilerplate.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!resp.ok) {
      throw new Error(`Gemini API returned status ${resp.status}`);
    }

    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  }

  private static async callGeminiChat(student: any, skillsStr: string, message: string, history: any[]): Promise<string> {
    const systemInstruction = `You are the AI Career Advisor for an engineering college student.
Student Context:
- Name: ${student.full_name}
- Degree: ${student.degree} in ${student.branch}
- CGPA: ${student.cgpa}
- Skills: ${skillsStr}
- Career Goal: ${student.career_goal || 'Software Engineering'}

Provide actionable, practical, inspiring, and concise career advice. Focus on skills, project ideas, recruitment preparation, and career pathways.`;

    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready to advise the student with tailored, practical guidance.' }] },
      ...history.map(h => ({
        role: h.sender === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.message }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    if (!resp.ok) {
      throw new Error(`Gemini API returned status ${resp.status}`);
    }

    const data = await resp.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  }
}
