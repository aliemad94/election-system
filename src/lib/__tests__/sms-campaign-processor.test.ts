import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  campaignFindMany: vi.fn(),
  campaignUpdateMany: vi.fn(),
  leaseFindFirst: vi.fn(),
  transaction: vi.fn(),
  writeAuditLog: vi.fn(),
}));

vi.mock("../prisma", () => ({
  prisma: {
    sMSCampaign: {
      findMany: mocks.campaignFindMany,
      updateMany: mocks.campaignUpdateMany,
    },
    schedulerLease: {
      findFirst: mocks.leaseFindFirst,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("../security", () => ({
  writeAuditLog: mocks.writeAuditLog,
}));

import { processDueCampaigns } from "../sms-campaign-processor";

describe("SMS campaign stale recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-22T18:00:00.000Z"));
    mocks.transaction.mockImplementation(
      async (callback: (tx: Record<string, never>) => unknown) => callback({})
    );
    mocks.campaignFindMany
      .mockResolvedValueOnce([{ id: "campaign-active" }])
      .mockResolvedValueOnce([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not recover a long-running campaign while its lease is active", async () => {
    mocks.leaseFindFirst.mockResolvedValue({
      name: "sms-campaign:campaign-active",
    });

    await expect(processDueCampaigns()).resolves.toBe(0);

    expect(mocks.leaseFindFirst).toHaveBeenCalledWith({
      where: {
        name: "sms-campaign:campaign-active",
        lockedUntil: { gt: new Date("2026-07-22T18:00:00.000Z") },
      },
      select: { name: true },
    });
    expect(mocks.campaignUpdateMany).not.toHaveBeenCalled();
  });

  it("recovers a stale campaign only after its lease expires", async () => {
    mocks.leaseFindFirst.mockResolvedValue(null);
    mocks.campaignUpdateMany.mockResolvedValue({ count: 1 });

    await expect(processDueCampaigns()).resolves.toBe(0);

    expect(mocks.campaignUpdateMany).toHaveBeenCalledWith({
      where: {
        id: "campaign-active",
        status: "PROCESSING",
        processingStartedAt: {
          lt: new Date("2026-07-22T17:55:00.000Z"),
        },
      },
      data: {
        status: "SCHEDULED",
        processingStartedAt: null,
        lastError: "Recovered after expired processing lease",
      },
    });
    expect(mocks.writeAuditLog).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        entity: "SMSCampaign",
        details: {
          action: "RECOVERED_STALE_CAMPAIGNS",
          count: 1,
        },
      })
    );
  });
});
