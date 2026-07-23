import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tracker = vi.hoisted(() => ({
  active: 0,
  maxActive: 0,
  order: [] as string[],
  async run<T>(name: string, result: T): Promise<T> {
    this.active += 1;
    this.maxActive = Math.max(this.maxActive, this.active);
    this.order.push(name);
    await Promise.resolve();
    this.active -= 1;
    return result;
  },
}));

vi.mock("../backup", () => ({
  runBackup: () => tracker.run("backup", { success: true }),
}));

vi.mock("../indicators-cache", () => ({
  getCachedIndicators: () => tracker.run("indicator-cache", {}),
}));

vi.mock("../prisma", () => ({
  prisma: {
    rateLimit: {
      deleteMany: () => tracker.run("cleanup-rate-limits", { count: 0 }),
    },
    schedulerLease: {
      deleteMany: () => tracker.run("cleanup-leases", { count: 0 }),
    },
  },
}));

vi.mock("../security", () => ({
  logServerError: vi.fn(),
}));

vi.mock("../sms-campaign-processor", () => ({
  acquireSchedulerLease: vi.fn(async (name: string) => ({
    acquired: true,
    owner: `owner-${name}`,
  })),
  processDueCampaigns: () => tracker.run("sms-campaigns", undefined),
  releaseSchedulerLease: vi.fn(async () => undefined),
}));

import { startScheduler } from "../scheduler";

describe("scheduler startup load", () => {
  beforeEach(() => {
    tracker.active = 0;
    tracker.maxActive = 0;
    tracker.order = [];
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("runs initial database workloads serially", async () => {
    startScheduler();

    await vi.advanceTimersByTimeAsync(10_000);

    expect(tracker.maxActive).toBe(1);
    expect(tracker.order).toEqual([
      "indicator-cache",
      "backup",
      "sms-campaigns",
      "cleanup-rate-limits",
      "cleanup-leases",
    ]);
  });
});
