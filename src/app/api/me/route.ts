// ====================================================================
// /api/me — إرجاع معلومات الجلسة الحالية
// يقرأ الـ JWT من الكوكي ويرجع الدور والصلاحيات
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const tokenCookie = req.cookies.get("election_auth");
    if (!tokenCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const payload = await verifyToken(tokenCookie.value);
    if (!payload) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      isOwner: payload.isOwner || payload.role === "ADMIN",
    });
  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
