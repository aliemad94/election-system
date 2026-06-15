import { NextRequest, NextResponse } from "next/server";
import { createToken, verifyToken } from "@/lib/auth";
import { getClientIp } from "@/lib/security";

export async function GET() {
  return NextResponse.json({ enabled: true });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { action } = rawBody;
    const clientIp = getClientIp(req);

    if (action === "login") {
      const response = NextResponse.json({
        success: true,
        role: "OBSERVER",
        mustChangePwd: false,
      });

      const token = await createToken({
        userId: "dummy-observer-id",
        username: "observer",
        role: "OBSERVER",
        isOwner: false,
      });

      response.cookies.set("election_auth", token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    if (action === "owner-login") {
      const response = NextResponse.json({
        success: true,
        role: "ADMIN",
        mustChangePwd: false,
      });

      const token = await createToken({
        userId: "dummy-admin-id",
        username: "admin",
        role: "ADMIN",
        isOwner: true,
      });

      response.cookies.set("election_auth", token, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[access-api] failed:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
