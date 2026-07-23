import { describe, expect, it } from "vitest";
import { normalizeIraqiPhoneForStorage } from "../validators";

describe("Iraqi phone storage normalization", () => {
  it.each([
    ["07701234567", "07701234567"],
    ["+9647701234567", "07701234567"],
    ["9647701234567", "07701234567"],
    ["964 (770) 123-4567", "07701234567"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeIraqiPhoneForStorage(input)).toBe(expected);
  });
});
