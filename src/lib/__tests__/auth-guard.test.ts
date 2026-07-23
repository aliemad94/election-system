import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  verifyToken: vi.fn(),
  userFindUnique: vi.fn(),
  configFindUnique: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  verifyToken: mocks.verifyToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.userFindUnique },
    systemConfig: { findUnique: mocks.configFindUnique },
  },
}));

import { withAuth } from "../auth-guard";

function request() {
  return new NextRequest("http://localhost/api/test", {
    method: "GET",
    headers: { cookie: "election_auth=test-token" },
  });
}

function crossSiteMutationRequest() {
  return new NextRequest("http://localhost/api/test", {
    method: "POST",
    headers: {
      cookie: "election_auth=test-token",
      origin: "https://attacker.invalid",
      "sec-fetch-site": "cross-site",
    },
  });
}

describe("حارس المصادقة", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyToken.mockResolvedValue({
      userId: "user-1",
      username: "stale-token-name",
      role: "ADMIN",
      isOwner: true,
      iat: Math.floor(Date.now() / 1_000),
      issuedAtMs: Date.now(),
    });
  });

  it("يرفض الحساب المعطل حتى مع JWT صالح", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user-1",
      username: "admin",
      role: "ADMIN",
      isActive: false,
      mustChangePwd: false,
      tokenIssuedBefore: null,
    });
    const secured = withAuth(
      async () => NextResponse.json({ ok: true }),
      { GET: ["ADMIN"] }
    );

    const response = await secured(request(), {});
    expect(response.status).toBe(403);
  });

  it("يبطل جلسة المراقب فور تعطيل الوصول", async () => {
    mocks.verifyToken.mockResolvedValue({
      userId: "observer-1",
      username: "observer",
      role: "OBSERVER",
      isOwner: false,
      iat: Math.floor(Date.now() / 1_000),
      issuedAtMs: Date.now(),
    });
    mocks.userFindUnique.mockResolvedValue({
      id: "observer-1",
      username: "observer",
      role: "OBSERVER",
      isActive: true,
      mustChangePwd: false,
      tokenIssuedBefore: null,
    });
    mocks.configFindUnique.mockResolvedValue({ enabled: false });
    const secured = withAuth(
      async () => NextResponse.json({ ok: true }),
      { GET: ["OBSERVER"] }
    );

    const response = await secured(request(), {});
    expect(response.status).toBe(403);
  });

  it("يمرر اسم المستخدم الحالي من قاعدة البيانات لا من التوكن", async () => {
    mocks.userFindUnique.mockResolvedValue({
      id: "user-1",
      username: "admin-current",
      role: "ADMIN",
      isActive: true,
      mustChangePwd: false,
      tokenIssuedBefore: null,
    });
    const secured = withAuth(
      async (_request, context) => NextResponse.json(context.user),
      { GET: ["ADMIN"] }
    );

    const response = await secured(request(), {});
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      username: "admin-current",
      role: "ADMIN",
    });
  });

  it("يرفض عملية تغييرية قادمة من أصل آخر قبل فحص الجلسة", async () => {
    const secured = withAuth(
      async () => NextResponse.json({ ok: true }),
      { POST: ["ADMIN"] }
    );

    const response = await secured(crossSiteMutationRequest(), {});
    expect(response.status).toBe(403);
    expect(mocks.verifyToken).not.toHaveBeenCalled();
  });
});
