import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimit: {
      findUnique: vi.fn(() => {
        throw new Error("Database connection pool exhausted");
      }),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { checkRateLimit, resetRateLimit } from "@/lib/security";

describe("Rate Limiter In-Memory Fail-Closed Fallback", () => {
  it("enforces rate limits using in-memory fallback when database throws an error", async () => {
    const key = "test_db_failure_key_" + Date.now();
    const maxAttempts = 3;
    const windowMs = 60000;

    // First 3 attempts should be allowed by in-memory fallback
    const res1 = await checkRateLimit(key, maxAttempts, windowMs);
    expect(res1.allowed).toBe(true);

    const res2 = await checkRateLimit(key, maxAttempts, windowMs);
    expect(res2.allowed).toBe(true);

    const res3 = await checkRateLimit(key, maxAttempts, windowMs);
    expect(res3.allowed).toBe(true);

    // 4th attempt MUST be BLOCKED (allowed = false) despite DB failure
    const res4 = await checkRateLimit(key, maxAttempts, windowMs);
    expect(res4.allowed).toBe(false);
    expect(res4.remainingAttempts).toBe(0);
  });

  it("clears the fallback entry after a successful reset", async () => {
    const key = "test_reset_key_" + Date.now();
    await checkRateLimit(key, 1, 60000);
    expect((await checkRateLimit(key, 1, 60000)).allowed).toBe(false);

    await resetRateLimit(key);
    expect((await checkRateLimit(key, 1, 60000)).allowed).toBe(true);
  });
});
