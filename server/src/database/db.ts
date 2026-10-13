import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

dotenv.config();

export interface QueryResult {
  insertId: number;
  affectedRows: number;
}

export type DbClientType = 'mysql' | 'sqlite';

let clientType: DbClientType = 'sqlite';
let mysqlPool: any = null;
let sqlDb: SqlJsDatabase | null = null;

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const sqlitePath = path.resolve(dataDir, 'career_guidance.db');

export function saveSqliteToDisk() {
  if (sqlDb && clientType === 'sqlite') {
    try {
      const data = sqlDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(sqlitePath, buffer);
    } catch (err) {
      console.error('Failed saving SQLite to disk:', err);
    }
  }
}

export async function initDatabase(): Promise<DbClientType> {
  const preferredClient = process.env.DB_CLIENT || 'auto';

  if (preferredClient === 'mysql' || preferredClient === 'auto') {
    try {
      const mysql = await import('mysql2/promise');
      const testPool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'career_guidance',
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });

      const connection = await Promise.race([
        testPool.getConnection(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('MySQL connection timeout')), 2000))
      ]) as any;

      await connection.ping();
      connection.release();

      mysqlPool = testPool;
      clientType = 'mysql';
      console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'career_guidance');
      return 'mysql';
    } catch (err: any) {
      if (preferredClient === 'mysql') {
        console.warn(`⚠️ MySQL requested but failed to connect (${err.message}). Falling back to embedded SQLite...`);
      } else {
        console.log('ℹ️ MySQL not active on localhost:3306. Utilizing zero-setup embedded SQLite database.');
      }
    }
  }

  // Embedded SQLite using sql.js
  try {
    const SQL = await initSqlJs();
    if (fs.existsSync(sqlitePath)) {
      const fileBuffer = fs.readFileSync(sqlitePath);
      sqlDb = new SQL.Database(fileBuffer);
    } else {
      sqlDb = new SQL.Database();
    }
    clientType = 'sqlite';
    console.log(`✅ Connected to SQLite database at: ${sqlitePath}`);

    createSqliteTables(sqlDb);
    saveSqliteToDisk();
    return 'sqlite';
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    throw err;
  }
}

function createSqliteTables(db: SqlJsDatabase) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      degree TEXT NOT NULL,
      branch TEXT NOT NULL,
      graduation_year INTEGER NOT NULL,
      college TEXT DEFAULT 'National Institute of Technology',
      cgpa REAL DEFAULT 0.00,
      profile_photo TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL UNIQUE,
      bio TEXT,
      career_goal TEXT DEFAULT '',
      preferred_job_role TEXT DEFAULT '',
      preferred_industry TEXT DEFAULT '',
      preferred_location TEXT DEFAULT '',
      completion_percentage INTEGER DEFAULT 20,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL DEFAULT 'technical',
      description TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS student_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      proficiency_level INTEGER NOT NULL DEFAULT 60,
      type TEXT DEFAULT 'technical',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
      UNIQUE(student_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS student_interests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      interest_name TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS privacy_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      organization_name TEXT NOT NULL,
      official_email TEXT NOT NULL,
      org_type TEXT NOT NULL DEFAULT 'Product Company',
      industry TEXT NOT NULL DEFAULT 'Information Technology',
      website TEXT DEFAULT '',
      location TEXT NOT NULL DEFAULT 'Bangalore, India',
      description TEXT,
      contact_phone TEXT DEFAULT '',
      contact_person TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS company_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL UNIQUE,
      logo_url TEXT DEFAULT '',
      banner_url TEXT DEFAULT '',
      about TEXT,
      culture TEXT,
      benefits TEXT,
      employee_count TEXT DEFAULT '50-200',
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS careers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      average_salary TEXT DEFAULT '₹8,00,000 - ₹16,00,000 / yr',
      growth_rate TEXT DEFAULT '+22% (High Growth)',
      responsibilities TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS career_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      career_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      importance TEXT NOT NULL DEFAULT 'required',
      weight INTEGER NOT NULL DEFAULT 5,
      min_proficiency INTEGER NOT NULL DEFAULT 70,
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
      UNIQUE(career_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      posted_by_company_id INTEGER DEFAULT NULL,
      title TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'Coursera / edX',
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      skill_tags TEXT,
      level TEXT NOT NULL DEFAULT 'intermediate',
      duration TEXT NOT NULL DEFAULT '6 Weeks',
      price_type TEXT NOT NULL DEFAULT 'free',
      price REAL DEFAULT 0.00,
      course_url TEXT NOT NULL DEFAULT 'https://example.com',
      rating REAL DEFAULT 4.8,
      status TEXT NOT NULL DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (posted_by_company_id) REFERENCES companies(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL DEFAULT 'onsite',
      salary_min INTEGER DEFAULT 600000,
      salary_max INTEGER DEFAULT 1200000,
      salary_currency TEXT DEFAULT 'INR',
      experience_level TEXT DEFAULT '0-2 Years (Fresher / Junior)',
      required_degree TEXT DEFAULT 'B.Tech / B.E. / M.C.A.',
      required_branch TEXT DEFAULT 'Any Engineering / CS / IT',
      required_skills TEXT,
      application_deadline TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      duration TEXT NOT NULL DEFAULT '3-6 Months',
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL DEFAULT 'hybrid',
      stipend TEXT DEFAULT '₹25,000 / month',
      skills TEXT,
      eligibility TEXT DEFAULT 'Current 3rd or final year B.Tech / MCA students',
      application_deadline TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recruitment_drives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      drive_date TEXT NOT NULL,
      venue_or_link TEXT NOT NULL,
      eligibility TEXT,
      min_cgpa REAL DEFAULT 7.00,
      required_degree TEXT DEFAULT 'B.Tech / B.E.',
      required_branch TEXT DEFAULT 'CSE, IT, ECE',
      required_skills TEXT,
      selection_process TEXT,
      application_deadline TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'applied',
      notes TEXT,
      timeline_events_json TEXT,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(student_id, item_type, item_id)
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(student_id, item_type, item_id)
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      career_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      target_role TEXT NOT NULL,
      total_stages INTEGER NOT NULL DEFAULT 6,
      completed_stages INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS roadmap_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roadmap_id INTEGER NOT NULL,
      stage_number INTEGER NOT NULL,
      stage_title TEXT NOT NULL,
      description TEXT NOT NULL,
      skills_json TEXT NOT NULL,
      resources_json TEXT NOT NULL,
      estimated_duration TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at DATETIME NULL,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skill_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      career_id INTEGER NOT NULL,
      match_percentage INTEGER NOT NULL,
      current_skills_json TEXT,
      missing_skills_json TEXT,
      priority_skills_json TEXT,
      reasoning TEXT,
      calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT 'Career Guidance Session',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      suggested_prompts_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'system',
      is_read INTEGER NOT NULL DEFAULT 0,
      link TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user_id INTEGER NOT NULL,
      action_type TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_user_id INTEGER NOT NULL,
      target_type TEXT NOT NULL,
      target_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (clientType === 'mysql' && mysqlPool) {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows as T[];
  } else if (sqlDb) {
    try {
      const stmt = sqlDb.prepare(sql);
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as unknown as T);
      }
      stmt.free();
      return rows;
    } catch (err: any) {
      console.error('SQL Query Error:', err.message, '\nQuery:', sql, '\nParams:', params);
      throw err;
    }
  }
  throw new Error('Database not initialized. Call initDatabase() first.');
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params: any[] = []): Promise<QueryResult> {
  if (clientType === 'mysql' && mysqlPool) {
    const [result] = await mysqlPool.execute(sql, params);
    return {
      insertId: (result as any).insertId || 0,
      affectedRows: (result as any).affectedRows || 0,
    };
  } else if (sqlDb) {
    try {
      sqlDb.run(sql, params);
      
      // Immediately retrieve last insert ID and affected changes
      const idRes = sqlDb.exec('SELECT last_insert_rowid() AS id;');
      const insertId = Number(idRes[0]?.values[0]?.[0] || 0);

      const chRes = sqlDb.exec('SELECT changes() AS ch;');
      const affectedRows = Number(chRes[0]?.values[0]?.[0] || 0);

      saveSqliteToDisk();

      return { insertId, affectedRows };
    } catch (err: any) {
      console.error('SQL Execute Error:', err.message, '\nQuery:', sql, '\nParams:', params);
      throw err;
    }
  }
  throw new Error('Database not initialized. Call initDatabase() first.');
}

export function getDbClientType(): DbClientType {
  return clientType;
}
