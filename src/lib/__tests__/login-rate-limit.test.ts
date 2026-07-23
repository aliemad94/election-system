import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  resetRateLimit: vi.fn(),
  auditLog: vi.fn(),
  userFindUnique: vi.fn(),
  compare: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: { compare: mocks.compare },
}));
vi.mock("@/lib/auth", () => ({ createToken: vi.fn(), verifyToken: vi.fn() }));
vi.mock("@/lib/config-store", () => ({
  getSystemConfig: vi.fn(() => ({ enabled: true })),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.userFindUnique } },
}));
vi.mock("@/lib/security", () => ({
  auditLog: mocks.auditLog,
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: vi.fn(() => "203.0.113.10"),
  rejectCrossSiteMutation: vi.fn(() => null),
  resetRateLimit: mocks.resetRateLimit,
  validatePassword: vi.fn(),
  writeAuditLog: vi.fn(),
}));

import { POST } from "../../app/api/access/route";

function login(username: string) {
  return POST(
    new NextRequest("https://example.test/api/access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "login", username, password: "invalid" }),
    })
  );
}

describe("login rate-limit key cardinality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.checkRateLimit.mockResolvedValue({
      allowed: true,
      remainingAttempts: 4,
      retryAfterMs: 0,
    });
    mocks.userFindUnique.mockResolvedValue(null);
    mocks.compare.mockResolvedValue(false);
    mocks.auditLog.mockResolvedValue(undefined);
  });

  it("maps arbitrary unknown usernames to the same bounded keys", async () => {
    await expect(login("attacker-name-one")).resolves.toMatchObject({ status: 401 });
    await expect(login("attacker-name-two")).resolves.toMatchObject({ status: 401 });

    expect(mocks.checkRateLimit.mock.calls.map((call) => call[0])).toEqual([
      "rate_limit_login_ip_203.0.113.10",
      "rate_limit_login_unknown_203.0.113.10",
      "rate_limit_login_ip_203.0.113.10",
      "rate_limit_login_unknown_203.0.113.10",
    ]);
  });
});
