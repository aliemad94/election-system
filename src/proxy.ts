// ====================================================================
// Proxy — حماية API Routes + حقن security headers
// يحمي كل /api/* ما عدا /api/access و /api/health
// (Next.js 16: proxy.ts يحل محل middleware.ts)
// ====================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // حماية كل /api/ ما عدا نقاط الدخول العامة
  const isProtectedApi =
    pathname.startsWith("/api") &&
    !pathname.startsWith("/api/access") &&
    !pathname.startsWith("/api/health");

  if (isProtectedApi) {
    const tokenCookie = request.cookies.get("election_auth");

    // وضع التطوير: تجاوز المصادقة إذا طُلب صراحةً
    if (!tokenCookie) {
      if (
        process.env.NODE_ENV === "development" &&
        process.env.BYPASS_AUTH === "true"
      ) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", "dummy-admin-id");
        requestHeaders.set("x-user-role", "ADMIN");
        requestHeaders.set("x-user-name", "admin");

        const response = NextResponse.next({
          request: { headers: requestHeaders },
        });
        applySecurityHeaders(response);
        return response;
      }
      return NextResponse.json(
        { error: "غير مصرح - يرجى تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    try {
      const token = tokenCookie.value;
      const payload = await verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { error: "غير مصرح - جلسة غير صالحة أو منتهية" },
          { status: 401 }
        );
      }

      // ملاحظة: لا نستعلم قاعدة البيانات في middleware لأنها تعمل في
      // Edge Runtime حيث لا تدعم اتصالات Prisma TCP المباشرة.
      // تم التحقق من توقيع التوكن أعلاه، والتحقق من قاعدة البيانات
      // يتم في Route Handlers عند الحاجة.

      // حقن معلومات المستخدم في headers للاستخدام downstream
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId);
      requestHeaders.set("x-user-role", payload.role);
      requestHeaders.set("x-user-name", payload.username);

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });

      applySecurityHeaders(response);
      return response;
    } catch {
      return NextResponse.json(
        { error: "غير مصرح - توكن تالف أو غير صالح" },
        { status: 401 }
      );
    }
  }

  // للمسارات غير المحمية: إضافة security headers فقط
  const response = NextResponse.next();
  applySecurityHeaders(response);
  return response;
}

/**
 * إضافة رؤوس أمان موحّدة لكل الردود
 */
function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
