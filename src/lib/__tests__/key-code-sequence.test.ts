import { describe, expect, it, vi } from "vitest";
import { reserveElectionKeyCodes } from "../key-code-sequence";

describe("حجز أكواد المفاتيح الانتخابية", () => {
  it("يعامل الأكواد كأرقام لا كنصوص ويحجز نطاقاً متتالياً", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ maxCode: BigInt(99) }]);

    const codes = await reserveElectionKeyCodes(
      { $queryRawUnsafe: query } as never,
      3
    );

    expect(codes).toEqual(["100", "101", "102"]);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("يرفض حجوزات غير محدودة", async () => {
    await expect(
      reserveElectionKeyCodes({ $queryRawUnsafe: vi.fn() } as never, 5_001)
    ).rejects.toThrow("Invalid election-key code reservation size");
  });
});
