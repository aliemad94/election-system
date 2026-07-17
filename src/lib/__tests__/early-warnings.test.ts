import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET as getEarlyWarnings } from "../../app/api/early-warnings/route";
import { prisma } from "../prisma";
import { verifyToken } from "../auth";

// Mock prisma and auth
vi.mock("../prisma", () => ({
  prisma: {
    voter: {
      count: vi.fn(),
    },
    electionKey: {
      count: vi.fn(),
    },
    earlyWarning: {
      findMany: vi.fn(),
    },
    service: {
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../auth", () => ({
  verifyToken: vi.fn(),
}));

describe("نظام الإنذار المبكر (Early Warnings)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockNextRequest = (url: string, cookies: Record<string, string>) => {
    const req = new NextRequest(url, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });
    // Mock cookies
    Object.defineProperty(req, "cookies", {
      value: {
        get: (name: string) => (cookies[name] ? { value: cookies[name] } : null),
      },
      writable: true,
    });
    return req;
  };

  it("يجب أن يرجع قائمة فارغة تماماً إذا كان عدد الناخبين = 0 وعدد المفاتيح = 0", async () => {
    // 1. تسجيل الدخول كـ ADMIN
    (verifyToken as any).mockResolvedValue({
      userId: "user_admin_1",
      username: "admin",
      role: "ADMIN",
      isOwner: true,
    });

    (prisma.user.findUnique as any).mockResolvedValue({
      id: "user_admin_1",
      role: "ADMIN",
      mustChangePwd: false,
    });

    // 2. محاكاة أن الناخبين والمفاتيح تساوي صفر في قاعدة البيانات
    (prisma.voter.count as any).mockResolvedValue(0);
    (prisma.electionKey.count as any).mockResolvedValue(0);

    const req = mockNextRequest("http://localhost/api/early-warnings", {
      election_auth: "valid-jwt",
    });

    const res = await getEarlyWarnings(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);
  });
});
