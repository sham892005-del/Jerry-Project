import { Request } from 'express';

export type UserRole = 'student' | 'recruiter' | 'admin';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  studentId?: number;
  companyId?: number;
  companyStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  fullName?: string;
  organizationName?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}
