// ====================================================================
// Next.js Proxy — حماية API وCSP nonce لكل طلب
// ====================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_API_PATHS = new Set([
  "/api/access",
  "/api/health",
  "/api/webhooks/twilio/status",
]);

function buildCsp(nonce: string): string {
  const production = process.env.NODE_ENV === "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval' 'unsafe-inline'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
    "connect-src 'self' https://*.supabase.com https://*.sentry.io",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(production ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

function secureResponse(response: NextResponse, csp: string): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  return response;
}

function jsonError(message: string, status: number, csp: string): NextResponse {
  return secureResponse(
    NextResponse.json({ error: message }, { status }),
    csp
  );
}

export async function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const csp = buildCsp(nonce);
  const { pathname } = request.nextUrl;
  const isProtectedApi =
    pathname.startsWith("/api") && !PUBLIC_API_PATHS.has(pathname);
  const bypassRequested =
    process.env.NODE_ENV === "development" &&
    process.env.BYPASS_AUTH === "true";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads the request CSP to apply the nonce to framework/bootstrap
  // scripts. The response header alone is too late for server rendering.
  requestHeaders.set("Content-Security-Policy", csp);
  requestHeaders.delete("x-user-id");
  requestHeaders.delete("x-user-role");
  requestHeaders.delete("x-user-name");

  if (isProtectedApi) {
    const token = request.cookies.get("election_auth")?.value;
    if (!token && !bypassRequested) {
      return jsonError("غير مصرح - يرجى تسجيل الدخول أولاً", 401, csp);
    }

    if (token) {
      const payload = await verifyToken(token);
      if (!payload) {
        return jsonError("غير مصرح - جلسة غير صالحة أو منتهية", 401, csp);
      }
      requestHeaders.set("x-user-id", payload.userId);
      requestHeaders.set("x-user-role", payload.role);
      requestHeaders.set("x-user-name", payload.username);
    } else {
      requestHeaders.set("x-user-id", "development-admin");
      requestHeaders.set("x-user-role", "ADMIN");
      requestHeaders.set("x-user-name", "admin");
    }
  }

  return secureResponse(
    NextResponse.next({ request: { headers: requestHeaders } }),
    csp
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
