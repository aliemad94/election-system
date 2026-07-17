import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as postSimulate } from "../../app/api/reset/simulate-turnout/route";
import { prisma } from "../prisma";
import { verifyToken } from "../auth";

vi.mock("../prisma", () => ({
  prisma: {
    voter: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(async (cb) => {
      return await cb(prisma);
    }),
  },
}));

vi.mock("../auth", () => ({
  verifyToken: vi.fn(),
}));

describe("مسار محاكاة وإعادة تعيين الحضور (Simulate Turnout Route Security)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRequest = (url: string, method: string, cookies: Record<string, string>, body?: any) => {
    const init: any = {
      method,
      headers: {
        "content-type": "application/json",
      },
    };
    if (body) {
      init.body = JSON.stringify(body);
    }
    const req = new NextRequest(url, init);
    Object.defineProperty(req, "cookies", {
      value: {
        get: (name: string) => (cookies[name] ? { value: cookies[name] } : null),
      },
      writable: true,
    });
    return req;
  };

  it("يجب أن يرفض طلبات GET للمحاكاة بالكامل ويعيد 405", async () => {
    const routeModule = await import("../../app/api/reset/simulate-turnout/route");
    expect((routeModule as any).GET).toBeUndefined();
  });

  it("يجب أن يرفض POST للمحاكاة إذا كان المستخدم غير ADMIN (KEY_USER)", async () => {
    (verifyToken as any).mockResolvedValue({
      userId: "user_key",
      username: "keyuser",
      role: "KEY_USER",
    });

    (prisma.user.findUnique as any).mockResolvedValue({
      id: "user_key",
      role: "KEY_USER",
      mustChangePwd: false,
    });

    const req = mockRequest("http://localhost/api/reset/simulate-turnout", "POST", {
      election_auth: "valid-jwt",
    });

    const res = await postSimulate(req, {});
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("غير مصرح");
  });

  it("يجب أن يرفض POST للمحاكاة إذا كانت القيمة المطلوبة count أكبر من 500", async () => {
    (verifyToken as any).mockResolvedValue({
      userId: "admin_id",
      username: "admin",
      role: "ADMIN",
    });

    (prisma.user.findUnique as any).mockResolvedValue({
      id: "admin_id",
      role: "ADMIN",
      mustChangePwd: false,
    });

    const req = mockRequest("http://localhost/api/reset/simulate-turnout?count=600", "POST", {
      election_auth: "valid-jwt",
    });

    const res = await postSimulate(req, {});
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("العدد المدخل غير صالح");
  });

  it("يجب أن يرفض POST للمحاكاة إذا كان NODE_ENV === 'production'", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as any).NODE_ENV = "production";

    (verifyToken as any).mockResolvedValue({
      userId: "admin_id",
      username: "admin",
      role: "ADMIN",
    });

    (prisma.user.findUnique as any).mockResolvedValue({
      id: "admin_id",
      role: "ADMIN",
      mustChangePwd: false,
    });

    const req = mockRequest("http://localhost/api/reset/simulate-turnout?count=100", "POST", {
      election_auth: "valid-jwt",
    });

    const res = await postSimulate(req, {});
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("محظورة");

    (process.env as any).NODE_ENV = originalEnv || "test";
  });
});
