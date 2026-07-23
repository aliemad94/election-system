import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  keyFindUnique: vi.fn(),
  userUpdateMany: vi.fn(),
  keyDelete: vi.fn(),
  taskDeleteMany: vi.fn(),
  serviceDeleteMany: vi.fn(),
  voterDeleteMany: vi.fn(),
  audit: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({
  withAuth: (handler: unknown) => handler,
}));
vi.mock("@/lib/security", () => ({
  handleApiError: vi.fn(() => new Response(null, { status: 500 })),
  writeAuditLog: mocks.audit,
}));
vi.mock("@/lib/comprehensive-indicators-cache", () => ({
  invalidateComprehensiveIndicatorsCache: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    electionKey: { findUnique: mocks.keyFindUnique },
    $transaction: mocks.transaction,
  },
}));

import { DELETE } from "../../app/api/electoral-keys/[id]/route";

describe("election-key deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.keyFindUnique.mockResolvedValue({
      id: "key-1",
      firstName: "Test",
      keyCode: "K-1",
    });
    mocks.userUpdateMany.mockResolvedValue({ count: 1 });
    mocks.taskDeleteMany.mockResolvedValue({ count: 0 });
    mocks.serviceDeleteMany.mockResolvedValue({ count: 0 });
    mocks.voterDeleteMany.mockResolvedValue({ count: 0 });
    mocks.keyDelete.mockResolvedValue({ id: "key-1" });
    mocks.audit.mockResolvedValue({});
    const tx = {
      user: { updateMany: mocks.userUpdateMany },
      task: { deleteMany: mocks.taskDeleteMany },
      service: { deleteMany: mocks.serviceDeleteMany },
      voter: { deleteMany: mocks.voterDeleteMany },
      electionKey: { delete: mocks.keyDelete },
      auditLog: { create: vi.fn() },
    };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof tx) => unknown) => callback(tx)
    );
  });

  it("disables and unlinks KEY_USER accounts before removing their key", async () => {
    const response = await DELETE(
      new NextRequest("https://example.test/api/electoral-keys/key-1", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({ id: "key-1" }),
        user: { userId: "admin-1", username: "admin", role: "ADMIN" },
      }
    );

    expect(response.status).toBe(200);
    expect(mocks.userUpdateMany).toHaveBeenCalledWith({
      where: { electionKeyId: "key-1" },
      data: expect.objectContaining({
        isActive: false,
        electionKeyId: null,
        tokenIssuedBefore: expect.any(Date),
      }),
    });
    expect(mocks.userUpdateMany.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.keyDelete.mock.invocationCallOrder[0]
    );
  });
});
