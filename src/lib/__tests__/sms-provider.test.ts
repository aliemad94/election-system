import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendSms,
  SmsSubmissionUnknownError,
} from "../sms-provider";

describe("SMS provider submission outcomes", () => {
  beforeEach(() => {
    process.env.SMS_ENABLED = "true";
    process.env.TWILIO_ACCOUNT_SID =
      "AC11111111111111111111111111111111";
    process.env.TWILIO_AUTH_TOKEN = "test-auth-token";
    process.env.TWILIO_FROM_NUMBER = "+12025550123";
    process.env.TWILIO_STATUS_CALLBACK_URL =
      "https://campaign.example/api/webhooks/twilio/status";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("classifies a network failure as an unknown submission outcome", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    await expect(
      sendSms(
        "TWILIO",
        "07701234567",
        "test message",
        "delivery_123456"
      )
    ).rejects.toBeInstanceOf(SmsSubmissionUnknownError);
  });

  it("classifies a provider 5xx response as an unknown outcome", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "temporary failure" }), {
          status: 503,
          headers: { "content-type": "application/json" },
        })
      )
    );

    await expect(
      sendSms(
        "TWILIO",
        "07701234567",
        "test message",
        "delivery_123456"
      )
    ).rejects.toBeInstanceOf(SmsSubmissionUnknownError);
  });

  it("keeps a definitive 4xx rejection retryable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "invalid recipient" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        })
      )
    );

    await expect(
      sendSms(
        "TWILIO",
        "07701234567",
        "test message",
        "delivery_123456"
      )
    ).rejects.toThrow("SMS provider rejected message (400)");
  });

  it("returns the provider SID only after an acknowledged submission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sid: "SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            status: "queued",
          }),
          {
            status: 201,
            headers: { "content-type": "application/json" },
          }
        )
      )
    );

    await expect(
      sendSms(
        "TWILIO",
        "07701234567",
        "test message",
        "delivery_123456"
      )
    ).resolves.toEqual({
      providerMessageId: "SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      providerStatus: "queued",
    });
  });
});
