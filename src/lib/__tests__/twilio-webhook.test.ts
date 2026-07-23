import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  validateRequest: vi.fn(),
  transaction: vi.fn(),
  deliveryFindFirst: vi.fn(),
  deliveryUpdate: vi.fn(),
  deliveryGroupBy: vi.fn(),
  campaignUpdate: vi.fn(),
  auditCreate: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock("twilio", () => ({
  validateRequest: mocks.validateRequest,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

import { POST } from "../../app/api/webhooks/twilio/status/route";

function webhookRequest() {
  const body = new URLSearchParams({
    AccountSid: "AC11111111111111111111111111111111",
    MessageSid: "SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    MessageStatus: "delivered",
  });
  return new NextRequest(
    "https://campaign.example/api/webhooks/twilio/status?deliveryId=delivery_123456",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-twilio-signature": "signed",
      },
      body,
    }
  );
}

describe("Twilio delivery callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMS_ENABLED = "true";
    process.env.TWILIO_AUTH_TOKEN = "auth-token";
    process.env.TWILIO_ACCOUNT_SID =
      "AC11111111111111111111111111111111";
    process.env.TWILIO_STATUS_CALLBACK_URL =
      "https://campaign.example/api/webhooks/twilio/status";

    const transactionClient = {
      $queryRaw: mocks.queryRaw,
      sMSDelivery: {
        findFirst: mocks.deliveryFindFirst,
        update: mocks.deliveryUpdate,
        groupBy: mocks.deliveryGroupBy,
      },
      sMSCampaign: {
        update: mocks.campaignUpdate,
      },
      auditLog: {
        create: mocks.auditCreate,
      },
    };
    mocks.transaction.mockImplementation(
      async (callback: (client: typeof transactionClient) => unknown) =>
        callback(transactionClient)
    );
    mocks.deliveryFindFirst.mockResolvedValue({
      id: "delivery_123456",
      campaignId: "campaign_1",
      providerStatus: "sent",
      status: "SENT",
    });
    mocks.deliveryGroupBy.mockResolvedValue([
      { status: "DELIVERED", _count: { id: 1 } },
    ]);
    mocks.deliveryUpdate.mockResolvedValue({});
    mocks.campaignUpdate.mockResolvedValue({});
    mocks.auditCreate.mockResolvedValue({});
    mocks.queryRaw.mockResolvedValue([{ id: "campaign_1" }]);
  });

  it("يرفض callback غير موقّع", async () => {
    mocks.validateRequest.mockReturnValue(false);
    const response = await POST(webhookRequest());
    expect(response.status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("يسجل التسليم ويحدّث الحملة داخل معاملة واحدة", async () => {
    mocks.validateRequest.mockReturnValue(true);
    const response = await POST(webhookRequest());
    expect(response.status).toBe(204);
    expect(mocks.deliveryFindFirst).toHaveBeenCalledTimes(2);
    expect(mocks.deliveryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "DELIVERED",
          providerMessageId: "SMaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        }),
      })
    );
    expect(mocks.campaignUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "DELIVERED" }),
      })
    );
    expect(mocks.queryRaw).toHaveBeenCalledTimes(1);
    expect(mocks.queryRaw.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.deliveryFindFirst.mock.invocationCallOrder[1]
    );
    expect(mocks.deliveryFindFirst.mock.invocationCallOrder[1]).toBeLessThan(
      mocks.deliveryUpdate.mock.invocationCallOrder[0]
    );
    expect(mocks.auditCreate).toHaveBeenCalledTimes(1);
  });

  it("does not update a delivery when its campaign no longer exists", async () => {
    mocks.validateRequest.mockReturnValue(true);
    mocks.queryRaw.mockResolvedValue([]);

    const response = await POST(webhookRequest());

    expect(response.status).toBe(204);
    expect(mocks.deliveryUpdate).not.toHaveBeenCalled();
    expect(mocks.campaignUpdate).not.toHaveBeenCalled();
  });

  it("uses the post-lock state and never regresses an already delivered row", async () => {
    mocks.validateRequest.mockReturnValue(true);
    mocks.deliveryFindFirst
      .mockResolvedValueOnce({
        id: "delivery_123456",
        campaignId: "campaign_1",
        providerStatus: "sent",
        status: "SENT",
      })
      .mockResolvedValueOnce({
        id: "delivery_123456",
        campaignId: "campaign_1",
        providerStatus: "delivered",
        status: "DELIVERED",
      });

    const response = await POST(webhookRequest());

    expect(response.status).toBe(204);
    expect(mocks.queryRaw).toHaveBeenCalledTimes(1);
    expect(mocks.deliveryFindFirst).toHaveBeenCalledTimes(2);
    expect(mocks.deliveryUpdate).not.toHaveBeenCalled();
    expect(mocks.campaignUpdate).not.toHaveBeenCalled();
  });
});
