import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createServiceSchema,
  createVoterSchema,
  updateElectionKeySchema,
} from "../validators";
import { validatePassword } from "../security";
import {
  isSmsProviderConfigured,
  normalizeIraqiPhone,
} from "../sms-provider";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.restoreAllMocks();
});

describe("سياسة كلمة المرور", () => {
  it("ترفض كلمات المرور الأقصر من 12 حرفاً", () => {
    expect(validatePassword("Abc!123456").valid).toBe(false);
  });

  it("ترفض كلمة بلا رمز خاص", () => {
    expect(validatePassword("StrongPassword123").valid).toBe(false);
  });

  it("تقبل كلمة طويلة تحتوي أحرفاً وأرقاماً ورمزاً", () => {
    expect(validatePassword("Strong-Pass-2026").valid).toBe(true);
  });
});

describe("حدود مدخلات المجال", () => {
  it("ترفض خدمة بكلفة سالبة", () => {
    expect(
      createServiceSchema.safeParse({
        title: "خدمة",
        cost: -1,
      }).success
    ).toBe(false);
  });

  it("ترفض إحداثيات خارج الكرة الأرضية", () => {
    expect(
      createVoterSchema.safeParse({
        firstName: "علي",
        latitude: 91,
      }).success
    ).toBe(false);
  });

  it("ترفض أصواتاً سالبة للمفتاح", () => {
    expect(
      updateElectionKeySchema.safeParse({ supportedVotes: -1 }).success
    ).toBe(false);
  });
});

describe("تهيئة SMS", () => {
  it("يطبع رقم الهاتف العراقي بصيغة E.164", () => {
    expect(normalizeIraqiPhone("07701234567")).toBe("+9647701234567");
    expect(normalizeIraqiPhone("+9647701234567")).toBe("+9647701234567");
  });

  it("يرفض رقماً غير عراقي صالح", () => {
    expect(() => normalizeIraqiPhone("12345")).toThrow();
  });

  it("لا يعتبر المزود جاهزاً من دون التفعيل وcallback", () => {
    process.env.SMS_ENABLED = "false";
    process.env.TWILIO_ACCOUNT_SID = "AC123";
    process.env.TWILIO_AUTH_TOKEN = "token";
    process.env.TWILIO_FROM_NUMBER = "+10000000000";
    process.env.TWILIO_STATUS_CALLBACK_URL =
      "https://example.com/api/webhooks/twilio/status";
    expect(isSmsProviderConfigured()).toBe(false);

    process.env.SMS_ENABLED = "true";
    expect(isSmsProviderConfigured()).toBe(true);
    delete process.env.TWILIO_STATUS_CALLBACK_URL;
    expect(isSmsProviderConfigured()).toBe(false);
  });
});
