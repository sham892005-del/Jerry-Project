import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload, UserRole } from '../types';
import { queryOne } from '../database/db';

const JWT_SECRET = process.env.JWT_SECRET || 'career_guidance_jwt_secret_key_2026_super_secure';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Fetch user from DB
    const user = await queryOne(
      'SELECT id, email, role, is_active FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user || user.is_active === 0) {
      res.status(401).json({ error: 'Unauthorized: User account is inactive or not found.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      isActive: Boolean(user.is_active),
    };

    // If student, attach studentId and fullName
    if (user.role === 'student') {
      const student = await queryOne(
        'SELECT id, full_name FROM students WHERE user_id = ?',
        [user.id]
      );
      if (student) {
        req.user.studentId = student.id;
        req.user.fullName = student.full_name;
      }
    }

    // If recruiter, attach companyId, companyStatus and organizationName
    if (user.role === 'recruiter') {
      const company = await queryOne(
        'SELECT id, organization_name, status FROM companies WHERE user_id = ?',
        [user.id]
      );
      if (company) {
        req.user.companyId = company.id;
        req.user.organizationName = company.organization_name;
        req.user.companyStatus = company.status;
      }
    }

    next();
  } catch (err: any) {
    res.status(401).json({ error: 'Unauthorized: Expired or invalid token.', details: err.message });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Please authenticate first.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Access restricted. Required role: [${roles.join(', ')}]. Current role: [${req.user.role}].`,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
}

export function requireApprovedCompany(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'recruiter') {
    res.status(403).json({ error: 'Forbidden: Recruiter access required.' });
    return;
  }

  if (req.user.companyStatus !== 'approved') {
    res.status(403).json({
      error: 'Organization approval pending. You cannot publish opportunities until an administrator approves your account.',
      companyStatus: req.user.companyStatus || 'pending',
    });
    return;
  }

  next();
}
