import { describe, it, expect } from "vitest";
import { maskPhone, maskNationalId } from "../response-dto";

describe("maskPhone", () => {
  it("يُظهر الهاتف كاملاً لـ ADMIN", () => {
    expect(maskPhone("07701234567", "ADMIN")).toBe("07701234567");
  });

  it("يُخفي الهاتف جزئياً لـ KEY_USER (سياسة معتمدة: القسم 2 من خطة الإصلاح)", () => {
    const result = maskPhone("07701234567", "KEY_USER");
    expect(result).not.toBe("07701234567");
    expect(result).toContain("****");
  });

  it("يُخفي الهاتف جزئياً لـ OBSERVER", () => {
    const result = maskPhone("07701234567", "OBSERVER");
    expect(result).not.toBe("07701234567");
    expect(result).toContain("****");
  });
});

describe("maskNationalId", () => {
  it("يُظهر الرقم الوطني كاملاً لـ ADMIN فقط", () => {
    expect(maskNationalId("1234567890", "ADMIN")).toBe("1234567890");
  });

  it("يُخفي الرقم الوطني لـ KEY_USER وOBSERVER", () => {
    expect(maskNationalId("1234567890", "KEY_USER")).toBe("***");
    expect(maskNationalId("1234567890", "OBSERVER")).toBe("***");
  });
});
