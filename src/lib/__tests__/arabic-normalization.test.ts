import { describe, it, expect } from "vitest";
import { normalizeArabicName, areNamesSimilar } from "../arabic-normalization";

describe("Arabic Normalization Library", () => {
  describe("normalizeArabicName", () => {
    it("should handle Salem spelling variations", () => {
      expect(normalizeArabicName("آل سالم")).toBe("سالم");
      expect(normalizeArabicName("السالم")).toBe("سالم");
      expect(normalizeArabicName("سالم")).toBe("سالم");
    });

    it("should handle Khafaja spelling variations", () => {
      expect(normalizeArabicName("خفاجة")).toBe("خفاج");
      expect(normalizeArabicName("الخفاجي")).toBe("خفاج");
      expect(normalizeArabicName("خفاجي")).toBe("خفاج");
      expect(normalizeArabicName("خفاجه")).toBe("خفاج");
    });

    it("should handle Ghazzi spelling variations", () => {
      expect(normalizeArabicName("غزي")).toBe("غز");
      expect(normalizeArabicName("الغزي")).toBe("غز");
      expect(normalizeArabicName("آل غزي")).toBe("غز");
      expect(normalizeArabicName("غزاوي")).toBe("غز");
    });

    it("should handle Rikabi spelling variations", () => {
      expect(normalizeArabicName("ركابي")).toBe("ركاب");
      expect(normalizeArabicName("الركابي")).toBe("ركاب");
    });

    it("should distinguish completely different names", () => {
      expect(normalizeArabicName("العبيدي")).toBe("عبيد");
      expect(normalizeArabicName("العميدي")).toBe("عميد");
      expect(normalizeArabicName("السالم")).toBe("سالم");
      expect(normalizeArabicName("السامر")).toBe("سامر");
    });
  });

  describe("areNamesSimilar", () => {
    it("should match Salem variations", () => {
      expect(areNamesSimilar("آل سالم", "السالم")).toBe(true);
      expect(areNamesSimilar("السالم", "سالم")).toBe(true);
    });

    it("should match Khafaja variations", () => {
      expect(areNamesSimilar("خفاجة", "الخفاجي")).toBe(true);
      expect(areNamesSimilar("خفاجي", "خفاجه")).toBe(true);
    });

    it("should match Ghazzi variations", () => {
      expect(areNamesSimilar("غزي", "الغزي")).toBe(true);
      expect(areNamesSimilar("آل غزي", "غزاوي")).toBe(true);
    });

    it("should match Rikabi variations", () => {
      expect(areNamesSimilar("ركابي", "الركابي")).toBe(true);
    });

    it("should not match different names", () => {
      expect(areNamesSimilar("العبيدي", "العميدي")).toBe(false);
      expect(areNamesSimilar("السالم", "السامر")).toBe(false);
    });
  });
});
