import { describe, expect, it } from "vitest";
import { deriveCampaignStatus } from "../sms-campaign-processor";

describe("SMS campaign status derivation", () => {
  it("keeps a retained failed delivery visible after the recipient filter changes", () => {
    const persistedDeliveries = new Map([
      ["DELIVERED", 1],
      ["FAILED", 1],
    ]);

    expect(deriveCampaignStatus(persistedDeliveries)).toBe("PARTIAL");
  });

  it("marks a campaign delivered only when every persisted delivery is delivered", () => {
    expect(deriveCampaignStatus(new Map([["DELIVERED", 2]]))).toBe("DELIVERED");
  });

  it("does not treat an unknown submission as fully submitted", () => {
    expect(
      deriveCampaignStatus(
        new Map([
          ["SENT", 1],
          ["SUBMISSION_UNKNOWN", 1],
        ])
      )
    ).toBe("PARTIAL");
  });
});
