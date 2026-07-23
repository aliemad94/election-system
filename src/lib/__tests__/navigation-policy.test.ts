import { describe, expect, it } from "vitest";
import { isPageAllowed } from "@/lib/navigation-policy";

describe("navigation role policy", () => {
  it("allows ADMIN to reach every privileged surface", () => {
    expect(isPageAllowed("ADMIN", "volunteers")).toBe(true);
    expect(isPageAllowed("ADMIN", "sms")).toBe(true);
    expect(isPageAllowed("ADMIN", "advanced-indicators")).toBe(true);
  });

  it("keeps KEY_USER on scoped/read-only surfaces", () => {
    expect(isPageAllowed("KEY_USER", "voters")).toBe(true);
    expect(isPageAllowed("KEY_USER", "warroom")).toBe(true);
    expect(isPageAllowed("KEY_USER", "volunteers")).toBe(false);
    expect(isPageAllowed("KEY_USER", "sms")).toBe(false);
    expect(isPageAllowed("KEY_USER", "advanced-indicators")).toBe(false);
  });

  it("limits OBSERVER to aggregate surfaces", () => {
    expect(isPageAllowed("OBSERVER", "dashboard")).toBe(true);
    expect(isPageAllowed("OBSERVER", "advanced-indicators")).toBe(true);
    expect(isPageAllowed("OBSERVER", "competitors")).toBe(false);
    expect(isPageAllowed("OBSERVER", "voters")).toBe(false);
  });

  it("denies unknown roles", () => {
    expect(isPageAllowed("UNKNOWN", "dashboard")).toBe(false);
    expect(isPageAllowed(undefined, "dashboard")).toBe(false);
  });
});

