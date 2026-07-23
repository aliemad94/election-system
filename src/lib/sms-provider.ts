// ====================================================================
// موفر SMS الإنتاجي — لا توجد محاكاة أو وسم SENT قبل تأكيد المزود
// ====================================================================

export interface SmsSendResult {
  providerMessageId: string;
  providerStatus: string;
}

export class SmsSubmissionUnknownError extends Error {
  constructor() {
    super("SMS provider submission outcome is unknown");
    this.name = "SmsSubmissionUnknownError";
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`SMS provider is not configured (${name})`);
  return value;
}

export function isSmsProviderConfigured(): boolean {
  return Boolean(
    process.env.SMS_ENABLED === "true" &&
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
    process.env.TWILIO_AUTH_TOKEN?.trim() &&
    process.env.TWILIO_FROM_NUMBER?.trim() &&
    process.env.TWILIO_STATUS_CALLBACK_URL?.trim()
  );
}

export function normalizeIraqiPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (/^07[3-9]\d{8}$/.test(digits)) return `+964${digits.slice(1)}`;
  if (/^\+9647[3-9]\d{8}$/.test(digits)) return digits;
  if (/^9647[3-9]\d{8}$/.test(digits)) return `+${digits}`;
  throw new Error("Invalid Iraqi mobile number");
}

export async function sendSms(
  provider: string,
  phone: string,
  message: string,
  deliveryId: string
): Promise<SmsSendResult> {
  if (provider !== "TWILIO") {
    throw new Error("Unsupported SMS provider");
  }

  const accountSid = requiredEnvironment("TWILIO_ACCOUNT_SID");
  const authToken = requiredEnvironment("TWILIO_AUTH_TOKEN");
  const fromNumber = requiredEnvironment("TWILIO_FROM_NUMBER");
  const statusCallback = requiredEnvironment("TWILIO_STATUS_CALLBACK_URL");
  if (process.env.SMS_ENABLED !== "true") {
    throw new Error("SMS sending is disabled");
  }
  const callbackUrl = new URL(statusCallback);
  if (
    callbackUrl.protocol !== "https:" ||
    callbackUrl.pathname !== "/api/webhooks/twilio/status"
  ) {
    throw new Error("TWILIO_STATUS_CALLBACK_URL is invalid");
  }
  callbackUrl.searchParams.set("deliveryId", deliveryId);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const body = new URLSearchParams({
      To: normalizeIraqiPhone(phone),
      From: fromNumber,
      Body: message,
      StatusCallback: callbackUrl.toString(),
    });
    let response: Response;
    try {
      response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
          signal: controller.signal,
        }
      );
    } catch {
      // A timeout/network failure cannot prove that Twilio rejected the
      // request. The status callback may still reconcile this delivery.
      throw new SmsSubmissionUnknownError();
    }
    const result = (await response.json().catch(() => ({}))) as {
      sid?: string;
      status?: string;
    };
    if (response.ok && result.sid) {
      return {
        providerMessageId: result.sid,
        providerStatus: result.status || "queued",
      };
    }
    if (response.ok || response.status === 408 || response.status >= 500) {
      throw new SmsSubmissionUnknownError();
    }
    if (!response.ok) {
      throw new Error(`SMS provider rejected message (${response.status})`);
    }
    throw new SmsSubmissionUnknownError();
  } finally {
    clearTimeout(timeout);
  }
}
