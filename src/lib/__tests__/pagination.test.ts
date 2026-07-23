import { describe, expect, it } from "vitest";
import { parsePagination } from "../pagination";

function params(value: string) {
  return new URL(`https://example.test/?${value}`).searchParams;
}

describe("parsePagination", () => {
  it("uses safe defaults", () => {
    expect(parsePagination(params(""), 25)).toEqual({ page: 1, limit: 25 });
  });

  it.each(["page=abc", "page=0", "page=-1", "page=1.5", "limit=NaN", "limit=101"])(
    "rejects malformed or out-of-range input: %s",
    (value) => {
      expect(parsePagination(params(value), 25)).toBeNull();
    }
  );

  it("accepts bounded positive integers", () => {
    expect(parsePagination(params("page=12&limit=100"), 25)).toEqual({
      page: 12,
      limit: 100,
    });
  });
});
