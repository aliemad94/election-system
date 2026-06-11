import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createToken, verifyToken } from '@/lib/auth';
import { z } from 'zod';

// ---- Zod Input Validation Schemas ----
const loginSchema = z.object({
  action: z.enum(['login', 'owner-login', 'change-password', 'toggle-access']),
  password: z.string().optional(),
  ownerPassword: z.string().optional(),
  newPassword: z.string().optional(),
  ownerToken: z.string().optional(),
  enabled: z.boolean().optional(),
  currentPassword: z.string().optional(),
});

const PASSWORD_MIN_LENGTH = 8;

// Rate limiting: track failed attempts per IP
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return true;
  if (Date.now() - entry.lastAttempt > LOCKOUT_MS) {
    failedAttempts.delete(ip);
    return true;
  }
  return entry.count < MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string) {
  const entry = failedAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  entry.count += 1;
  entry.lastAttempt = Date.now();
  failedAttempts.set(ip, entry);
}

function clearFailedAttempts(ip: string) {
  failedAttempts.delete(ip);
}

// GET: Check if access is enabled + health check
export async function GET() {
  return NextResponse.json({ enabled: true });
}

// POST: Handle login, change password, etc.
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    
    // Validate input with Zod
    const parseResult = loginSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: 'بيانات غير صالحة' },
        { status: 400 }
      );
    }
    
    const body = parseResult.data;
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // ---- LOGIN ACTION ----
    if (body.action === 'login') {
      if (!body.password) {
        return NextResponse.json({ success: false, message: 'كلمة المرور مطلوبة' }, { status: 400 });
      }

      // Rate limiting check
      if (!checkRateLimit(clientIp)) {
        return NextResponse.json(
          { success: false, message: 'تم تجاوز عدد المحاولات. حاول بعد 15 دقيقة' },
          { status: 429 }
        );
      }

      const user = await db.user.findFirst({
        where: { role: { in: ['OBSERVER', 'KEY_USER'] } }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'مستخدم الزائر غير موجود في النظام' },
          { status: 404 }
        );
      }

      const match = await bcrypt.compare(body.password, user.password);
      if (!match) {
        recordFailedAttempt(clientIp);
        return NextResponse.json(
          { success: false, message: 'كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }

      // Create signed JWT token
      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: false,
      });

      clearFailedAttempts(clientIp);
      const response = NextResponse.json({ success: true, role: user.role });
      response.cookies.set('election_auth', token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    // ---- OWNER LOGIN ACTION ----
    if (body.action === 'owner-login') {
      if (!body.ownerPassword) {
        return NextResponse.json({ success: false, message: 'كلمة المرور مطلوبة' }, { status: 400 });
      }

      // Rate limiting check
      if (!checkRateLimit(clientIp)) {
        return NextResponse.json(
          { success: false, message: 'تم تجاوز عدد المحاولات. حاول بعد 15 دقيقة' },
          { status: 429 }
        );
      }

      const user = await db.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'مستخدم المسؤول غير موجود في النظام' },
          { status: 404 }
        );
      }

      const match = await bcrypt.compare(body.ownerPassword, user.password);
      if (!match) {
        recordFailedAttempt(clientIp);
        return NextResponse.json(
          { success: false, message: 'كلمة مرور المالك غير صحيحة' },
          { status: 401 }
        );
      }

      // Create signed JWT token
      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: true,
      });

      clearFailedAttempts(clientIp);
      const response = NextResponse.json({ success: true, role: 'ADMIN' });
      response.cookies.set('election_auth', token, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // ---- CHANGE PASSWORD ACTION ----
    if (body.action === 'change-password') {
      // Verify owner token from httpOnly cookie
      const tokenCookie = req.cookies.get('election_auth');
      if (!tokenCookie) {
        return NextResponse.json({ success: false, message: 'غير مصرح - يرجى تسجيل الدخول' }, { status: 403 });
      }

      const payload = await verifyToken(tokenCookie.value);
      if (!payload || !payload.isOwner) {
        return NextResponse.json({ success: false, message: 'غير مصرح - صلاحيات غير كافية' }, { status: 403 });
      }

      // Validate current password
      if (!body.currentPassword) {
        return NextResponse.json({ success: false, message: 'يجب إدخال كلمة المرور الحالية' }, { status: 400 });
      }

      const adminUser = await db.user.findFirst({ where: { role: 'ADMIN' } });
      if (!adminUser) {
        return NextResponse.json({ success: false, message: 'المستخدم غير موجود' }, { status: 404 });
      }

      const currentMatch = await bcrypt.compare(body.currentPassword, adminUser.password);
      if (!currentMatch) {
        return NextResponse.json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 });
      }

      // Validate new password strength
      if (!body.newPassword || body.newPassword.length < PASSWORD_MIN_LENGTH) {
        return NextResponse.json(
          { success: false, message: `كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} أحرف على الأقل` },
          { status: 400 }
        );
      }

      // Password complexity check
      const hasLetter = /[a-zA-Z]/.test(body.newPassword);
      const hasNumber = /[0-9]/.test(body.newPassword);
      if (!hasLetter || !hasNumber) {
        return NextResponse.json(
          { success: false, message: 'كلمة المرور يجب أن تحتوي على أحرف وأرقام' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, 12);
      await db.user.update({
        where: { id: adminUser.id },
        data: { password: hashedPassword }
      });

      return NextResponse.json({ success: true });
    }

    // ---- TOGGLE ACCESS ACTION ----
    if (body.action === 'toggle-access') {
      return NextResponse.json({ success: true, enabled: true });
    }

    return NextResponse.json({ success: false, message: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في النظام' }, { status: 500 });
  }
}
