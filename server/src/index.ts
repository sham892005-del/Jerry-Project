import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, query, queryOne } from './database/db';

import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import recruiterRoutes from './routes/recruiter.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);

// Public Careers & Skills endpoints
app.get('/api/careers', async (req: Request, res: Response) => {
  try {
    const careers = await query('SELECT * FROM careers ORDER BY title ASC');
    res.json({ careers });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch careers.', details: err.message });
  }
});

app.get('/api/careers/:id', async (req: Request, res: Response) => {
  try {
    const career = await queryOne('SELECT * FROM careers WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    if (!career) {
      res.status(404).json({ error: 'Career not found.' });
      return;
    }

    const skills = await query(
      `SELECT cs.*, sk.name as skill_name, sk.category as skill_category
       FROM career_skills cs
       JOIN skills sk ON sk.id = cs.skill_id
       WHERE cs.career_id = ?
       ORDER BY cs.importance DESC, cs.weight DESC`,
      [career.id]
    );

    res.json({ career, skills });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch career details.', details: err.message });
  }
});

app.get('/api/skills', async (req: Request, res: Response) => {
  try {
    const skills = await query('SELECT * FROM skills ORDER BY category ASC, name ASC');
    res.json({ skills });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch skills.', details: err.message });
  }
});

// System Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI-Assisted Career Guidance System API',
    version: '1.0.0',
  });
});

// Serve client build if available (production mode)
import path from 'path';
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// 404 handler for unknown API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Fallback all non-API GET routes to client SPA index.html
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.',
  });
});

// Start Server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server successfully started on http://localhost:${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
