import { describe, expect, it } from "vitest";

import { calculatePollingCenterCoverage } from "../indicators-engine";

describe("calculatePollingCenterCoverage", () => {
  it("counts unique named centers against the declared commission total", () => {
    expect(
      calculatePollingCenterCoverage(
        ["مركز الهدى", "مركز الهدى", " مركز النور "],
        4
      )
    ).toBe(50);
  });

  it("returns zero without a valid declared total", () => {
    expect(calculatePollingCenterCoverage(["مركز الهدى"], 0)).toBe(0);
  });

  it("caps inconsistent source data at one hundred percent", () => {
    expect(calculatePollingCenterCoverage(["أ", "ب", "ج"], 2)).toBe(100);
  });
});
