/**
 * Security utilities library for the Electoral System
 * Provides: RBAC, input sanitization, audit logging, CSRF, rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from './prisma';

// ==================== RBAC (Role-Based Access Control) ====================

export type Role = 'ADMIN' | 'KEY_USER' | 'OBSERVER';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  ADMIN: ['read', 'write', 'delete', 'manage_users', 'change_password', 'toggle_access', 'manage_system'],
  KEY_USER: ['read', 'write', 'manage_own_keys'],
  OBSERVER: ['read'],
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = ROLE_PERMISSIONS[role as Role];
  return perms ? perms.includes(permission) : false;
}

export function getUserFromHeaders(request: NextRequest): {
  userId: string;
  role: string;
  username: string;
} | null {
  const userId = request.headers.get('x-user-id');
  const role = request.headers.get('x-user-role');
  const username = request.headers.get('x-user-name');
  
  if (!userId || !role || !username) return null;
  return { userId, role, username };
}

/**
 * Require specific permission - returns error response if not authorized
 */
export function requirePermission(
  request: NextRequest, 
  permission: string
): { user: { userId: string; role: string; username: string } } | { error: NextResponse } {
  const user = getUserFromHeaders(request);
  if (!user) {
    return { error: NextResponse.json({ error: 'غير مصرح - يرجى تسجيل الدخول' }, { status: 401 }) };
  }
  if (!hasPermission(user.role, permission)) {
    return { error: NextResponse.json({ error: 'غير مصرح - صلاحيات غير كافية' }, { status: 403 }) };
  }
  return { user };
}

// ==================== Input Sanitization ====================

/**
 * Sanitize string input to prevent XSS and injection
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['";\\]/g, '') // Remove SQL injection chars
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize a CUID ID
 */
export function isValidCuid(id: unknown): boolean {
  if (typeof id !== 'string') return false;
  return /^c[a-z0-9]{20,}$/.test(id);
}

/**
 * Validate phone number (Iraqi format)
 */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== 'string') return false;
  return /^07[3-9]\d{8}$/.test(phone.replace(/\s/g, ''));
}

// ==================== Audit Logging ====================

export type AuditAction = 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'CHANGE_PASSWORD' | 'TOGGLE_ACCESS';

export async function auditLog(params: {
  userId?: string;
  username: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  details?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
}): Promise<void> {
  // Audit logging stubbed because auditLog model is removed from schema
  console.log('Audit log entry:', params);
}

// ==================== CSRF Protection ====================

const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

interface CsrfToken {
  token: string;
  createdAt: number;
}

const csrfTokens = new Map<string, CsrfToken>();

/**
 * Generate a CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  // Clean up expired tokens
  const now = Date.now();
  for (const [key, value] of csrfTokens.entries()) {
    if (now - value.createdAt > CSRF_TOKEN_EXPIRY) {
      csrfTokens.delete(key);
    }
  }

  const token = `csrf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  csrfTokens.set(sessionId, { token, createdAt: now });
  return token;
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;
  
  const now = Date.now();
  if (now - stored.createdAt > CSRF_TOKEN_EXPIRY) {
    csrfTokens.delete(sessionId);
    return false;
  }
  
  return stored.token === token;
}

// ==================== Rate Limiting (Enhanced) ====================

interface RateLimitEntry {
  count: number;
  lastAttempt: number;
  blocked: boolean;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string, 
  maxAttempts: number = 5, 
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remainingAttempts: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v.lastAttempt > windowMs) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!entry || now - entry.lastAttempt > windowMs) {
    rateLimitStore.set(key, { count: 1, lastAttempt: now, blocked: false });
    return { allowed: true, remainingAttempts: maxAttempts - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxAttempts) {
    const retryAfterMs = windowMs - (now - entry.lastAttempt);
    return { allowed: false, remainingAttempts: 0, retryAfterMs };
  }

  entry.count += 1;
  entry.lastAttempt = now;
  return { allowed: true, remainingAttempts: maxAttempts - entry.count, retryAfterMs: 0 };
}

/**
 * Reset rate limit for a given key
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// ==================== Secure Error Handler ====================

/**
 * Handle errors securely - never expose internal details to clients
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  // Log the full error server-side for debugging
  console.error(`API Error${context ? ` (${context})` : ''}:`, error);
  
  // Check for known Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };
    
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          { error: 'البيانات موجودة مسبقاً - يوجد تكرار في الحقول الفريدة' },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          { error: 'السجل غير موجود' },
          { status: 404 }
        );
      case 'P2003':
        return NextResponse.json(
          { error: 'مرجع غير صالح - السجل المرتبط غير موجود' },
          { status: 400 }
        );
      default:
        break;
    }
  }
  
  // Generic error - never expose stack traces or internal messages
  return NextResponse.json(
    { error: 'حدث خطأ في النظام. يرجى المحاولة لاحقاً' },
    { status: 500 }
  );
}

// ==================== Password Policy ====================

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate password against security policy
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  
  if (password.length > 128) {
    errors.push('كلمة المرور يجب ألا تتجاوز 128 حرف');
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على أحرف إنجليزية');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على أرقام');
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', '12345678', 'qwerty12', 'abc12345',
    'admin2024', 'election2024', 'admin123', 'password1',
  ];
  if (weakPasswords.some(wp => password.toLowerCase().includes(wp))) {
    errors.push('كلمة المرور ضعيفة جداً - يرجى اختيار كلمة مرور أكثر تعقيداً');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown';
}
