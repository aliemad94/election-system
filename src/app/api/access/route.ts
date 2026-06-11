import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createToken, verifyToken } from '@/lib/auth';
import { z } from 'zod';
import {
  checkRateLimit,
  resetRateLimit,
  auditLog,
  validatePassword,
  getClientIp,
  handleApiError,
} from '@/lib/security';

// ---- Zod Input Validation Schemas ----
const loginSchema = z.object({
  action: z.enum(['login', 'owner-login', 'change-password', 'toggle-access']),
  password: z.string().max(128).optional(),
  ownerPassword: z.string().max(128).optional(),
  newPassword: z.string().max(128).optional(),
  ownerToken: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  currentPassword: z.string().max(128).optional(),
});

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
    const clientIp = getClientIp(req);

    // ---- LOGIN ACTION ----
    if (body.action === 'login') {
      if (!body.password) {
        return NextResponse.json({ success: false, message: 'كلمة المرور مطلوبة' }, { status: 400 });
      }

      // Rate limiting check
      const rateLimit = checkRateLimit(`login:${clientIp}`);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, message: `تم تجاوز عدد المحاولات. حاول بعد ${Math.ceil(rateLimit.retryAfterMs / 60000)} دقيقة` },
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
        await auditLog({ username: 'unknown', action: 'LOGIN', details: { reason: 'wrong_password', ip: clientIp }, ipAddress: clientIp });
        return NextResponse.json(
          { success: false, message: 'كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }

      // Check must change password flag
      if (user.mustChangePwd) {
        // Still allow login but inform frontend
      }

      // Create signed JWT token
      const token = await createToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        isOwner: false,
      });

      resetRateLimit(`login:${clientIp}`);
      await auditLog({ userId: user.id, username: user.username, action: 'LOGIN', details: { role: user.role }, ipAddress: clientIp });

      const response = NextResponse.json({ 
        success: true, 
        role: user.role,
        mustChangePwd: user.mustChangePwd,
      });
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

      // Rate limiting check (separate limit for owner login)
      const rateLimit = checkRateLimit(`owner-login:${clientIp}`, 3, 30 * 60 * 1000);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { success: false, message: `تم تجاوز عدد المحاولات. حاول بعد ${Math.ceil(rateLimit.retryAfterMs / 60000)} دقيقة` },
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
        await auditLog({ username: 'admin', action: 'LOGIN', details: { reason: 'wrong_owner_password', ip: clientIp }, ipAddress: clientIp });
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

      resetRateLimit(`owner-login:${clientIp}`);
      await auditLog({ userId: user.id, username: user.username, action: 'LOGIN', details: { role: 'ADMIN', isOwner: true }, ipAddress: clientIp });

      const response = NextResponse.json({ success: true, role: 'ADMIN', mustChangePwd: user.mustChangePwd });
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

      // Validate new password strength using security policy
      if (!body.newPassword) {
        return NextResponse.json({ success: false, message: 'كلمة المرور الجديدة مطلوبة' }, { status: 400 });
      }

      const passwordValidation = validatePassword(body.newPassword);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { success: false, message: passwordValidation.errors.join('. ') },
          { status: 400 }
        );
      }

      // Prevent reusing the same password
      const samePassword = await bcrypt.compare(body.newPassword, adminUser.password);
      if (samePassword) {
        return NextResponse.json(
          { success: false, message: 'لا يمكن استخدام نفس كلمة المرور الحالية' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(body.newPassword, 12);
      await db.user.update({
        where: { id: adminUser.id },
        data: { password: hashedPassword, mustChangePwd: false },
      });

      await auditLog({ 
        userId: adminUser.id, 
        username: adminUser.username, 
        action: 'CHANGE_PASSWORD', 
        ipAddress: clientIp 
      });

      return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
    }

    // ---- TOGGLE ACCESS ACTION ----
    if (body.action === 'toggle-access') {
      // Verify owner token
      const tokenCookie = req.cookies.get('election_auth');
      if (!tokenCookie) {
        return NextResponse.json({ success: false, message: 'غير مصرح' }, { status: 403 });
      }
      const payload = await verifyToken(tokenCookie.value);
      if (!payload || !payload.isOwner) {
        return NextResponse.json({ success: false, message: 'صلاحيات غير كافية' }, { status: 403 });
      }

      // For now, always returns enabled (toggle-access feature can be implemented later with DB flag)
      await auditLog({ 
        userId: payload.userId, 
        username: payload.username, 
        action: 'TOGGLE_ACCESS', 
        details: { enabled: body.enabled ?? true }, 
        ipAddress: clientIp 
      });

      return NextResponse.json({ success: true, enabled: true });
    }

    return NextResponse.json({ success: false, message: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    return handleApiError(error, 'access-api');
  }
}
