import { describe, expect, it } from "vitest";
import { RequestBodyTooLargeError, readJsonBodyWithinLimit } from "@/lib/request-body";

describe("readJsonBodyWithinLimit", () => {
  it("parses a JSON request within the configured byte limit", async () => {
    const request = new Request("https://example.test/import", {
      method: "POST",
      body: JSON.stringify({ type: "tribes", data: [] }),
    });

    await expect(readJsonBodyWithinLimit<{ type: string }>(request, 1024)).resolves.toMatchObject({ type: "tribes" });
  });

  it("rejects oversized request bodies", async () => {
    const request = new Request("https://example.test/import", {
      method: "POST",
      body: JSON.stringify({ data: "x".repeat(1024) }),
    });

    await expect(readJsonBodyWithinLimit(request, 100)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
  });
});
