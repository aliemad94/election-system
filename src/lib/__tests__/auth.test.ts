// @vitest-environment node

import { SignJWT } from "jose";
import { beforeAll, describe, expect, it } from "vitest";

import { createToken, verifyToken } from "../auth";

const secret = "vitest-jwt-secret-with-more-than-thirty-two-characters";

describe("JWT session timestamps", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = secret;
    delete process.env.JWT_SECRET_PREVIOUS;
  });

  it("adds a millisecond-precision issuance timestamp", async () => {
    const before = Date.now();
    const token = await createToken({
      userId: "user-1",
      username: "admin",
      role: "ADMIN",
      isOwner: true,
    });
    const payload = await verifyToken(token);

    expect(payload?.issuedAtMs).toBeGreaterThanOrEqual(before);
    expect(payload?.issuedAtMs).toBeLessThanOrEqual(Date.now());
  });

  it("rejects legacy tokens that cannot be revoked precisely", async () => {
    const token = await new SignJWT({
      userId: "user-1",
      username: "admin",
      role: "ADMIN",
      isOwner: true,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .setSubject("user-1")
      .setIssuer("electoral-system")
      .setAudience("electoral-system-users")
      .sign(new TextEncoder().encode(secret));

    await expect(verifyToken(token)).resolves.toBeNull();
  });
});
