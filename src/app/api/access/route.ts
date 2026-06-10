import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET: Check if access is enabled (always enabled under the new User account system)
export async function GET() {
  return NextResponse.json({ enabled: true });
}

// POST: Handle login attempt or change password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, password, ownerPassword, newPassword, ownerToken } = body;

    if (action === 'login') {
      // Find the observer or key_user in the database
      const user = await db.user.findFirst({
        where: {
          username: { in: ['observer', 'key_user'] }
        }
      });

      if (!user) {
        return NextResponse.json({ success: false, message: 'مستخدم الزائر غير موجود في النظام' }, { status: 404 });
      }

      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const tokenStr = `${user.username}:${Date.now()}`;
        const token = Buffer.from(tokenStr).toString('base64');
        const response = NextResponse.json({ success: true, token });
        response.cookies.set('election_auth', token, {
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        return response;
      }
      return NextResponse.json({ success: false, message: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    if (action === 'owner-login') {
      // Find the admin user in the database
      const user = await db.user.findUnique({
        where: { username: 'admin' }
      });

      if (!user) {
        return NextResponse.json({ success: false, message: 'مستخدم المسؤول غير موجود في النظام' }, { status: 404 });
      }

      const match = await bcrypt.compare(ownerPassword, user.password);
      if (match) {
        const tokenStr = `owner:${user.username}:${Date.now()}`;
        const token = Buffer.from(tokenStr).toString('base64');
        const response = NextResponse.json({ success: true, token });
        response.cookies.set('election_auth', token, {
          path: '/',
          httpOnly: false,
          secure: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        return response;
      }
      return NextResponse.json({ success: false, message: 'كلمة مرور المالك غير صحيحة' }, { status: 401 });
    }

    if (action === 'change-password') {
      // Validate owner token
      if (!ownerToken) {
        return NextResponse.json({ success: false, message: 'غير مصرح - توكن مفقود' }, { status: 403 });
      }

      const decoded = Buffer.from(ownerToken, 'base64').toString();
      if (!decoded.startsWith('owner:')) {
        return NextResponse.json({ success: false, message: 'غير مصرح - توكن غير صالح' }, { status: 403 });
      }

      if (!newPassword || newPassword.length < 4) {
        return NextResponse.json({ success: false, message: 'كلمة المرور قصيرة جداً' }, { status: 400 });
      }

      // Hash and update the admin user password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.user.update({
        where: { username: 'admin' },
        data: { password: hashedPassword }
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'toggle-access') {
      // Stub toggle-access to keep OwnerPanel happy
      return NextResponse.json({ success: true, enabled: true });
    }

    return NextResponse.json({ success: false, message: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ في النظام' }, { status: 500 });
  }
}
