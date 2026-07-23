import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  userFindUnique: vi.fn(),
  transactionUserFindUnique: vi.fn(),
  userCount: vi.fn(),
  userUpdate: vi.fn(),
  queryRaw: vi.fn(),
  audit: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
  withAuth: (handler: unknown) => handler,
}));

vi.mock("@/lib/security", () => ({
  handleApiError: vi.fn(() => new Response(null, { status: 500 })),
  validatePassword: vi.fn(() => ({ valid: true, errors: [] })),
  writeAuditLog: mocks.audit,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.userFindUnique },
    $transaction: mocks.transaction,
  },
}));

import { PATCH } from "../../app/api/users/route";

const actor = {
  userId: "current-admin",
  username: "admin",
  role: "ADMIN",
  electionKeyId: null,
};

function demoteRequest() {
  return new NextRequest("https://example.test/api/users", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: "target-admin", role: "OBSERVER" }),
  });
}

describe("active administrator invariant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userFindUnique.mockResolvedValue({
      role: "ADMIN",
      electionKeyId: null,
    });
    mocks.transactionUserFindUnique.mockResolvedValue({
      role: "ADMIN",
      isActive: true,
    });
    mocks.queryRaw.mockResolvedValue([{ pg_advisory_xact_lock: null }]);
    mocks.userUpdate.mockResolvedValue({
      id: "target-admin",
      username: "second-admin",
      role: "OBSERVER",
      isActive: true,
      mustChangePwd: false,
      electionKeyId: null,
    });
    mocks.audit.mockResolvedValue({});
    const tx = {
      $queryRaw: mocks.queryRaw,
      user: {
        findUnique: mocks.transactionUserFindUnique,
        count: mocks.userCount,
        update: mocks.userUpdate,
      },
      auditLog: { create: vi.fn() },
    };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx)
    );
  });

  it("blocks demoting the last active administrator", async () => {
    mocks.userCount.mockResolvedValue(0);

    const response = await PATCH(demoteRequest(), { params: Promise.resolve({}), user: actor });

    expect(response.status).toBe(409);
    expect(mocks.queryRaw).toHaveBeenCalledTimes(1);
    expect(mocks.userUpdate).not.toHaveBeenCalled();
  });

  it("allows demotion when another active administrator remains", async () => {
    mocks.userCount.mockResolvedValue(1);

    const response = await PATCH(demoteRequest(), { params: Promise.resolve({}), user: actor });

    expect(response.status).toBe(200);
    expect(mocks.userUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.audit).toHaveBeenCalledTimes(1);
  });

  it("returns a controlled conflict when a concurrent unique claim wins", async () => {
    mocks.userCount.mockResolvedValue(1);
    mocks.userUpdate.mockRejectedValue({ code: "P2002" });

    const response = await PATCH(demoteRequest(), { params: Promise.resolve({}), user: actor });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      error: expect.any(String),
    });
  });
});
