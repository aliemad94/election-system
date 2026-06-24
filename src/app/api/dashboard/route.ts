// ====================================================================
// /api/dashboard — التحقق من الجلسة + إرجاع معلومات المستخدم
// تُستخدم عند تحميل الواجهة لتحديد حالة المصادقة والدور
// ====================================================================

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth-guard";

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req as any);

    if (!user) {
      return NextResponse.json(
        { error: "غير مصرح - يرجى تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        isOwner: user.role === "ADMIN",
      },
    });
  } catch (error) {
    console.error("Dashboard session check failed:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحقق من الجلسة" },
      { status: 500 }
    );
  }
}

