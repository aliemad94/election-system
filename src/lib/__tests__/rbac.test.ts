// ====================================================================
// اختبارات الصلاحيات (RBAC) وخدمة النطاق
// ====================================================================

import { describe, it, expect, vi, beforeEach } from "vitest";

// === إعداد الـ Mock لـ scope-service ===
const { mockFindUnique } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockFindUnique(...args),
    },
  },
}));

// === اختبارات scope-service (وحدة) ===
describe("scope-service", () => {

  // Static import works now because vi.mock is hoisted
  let applyKeyUserScope: typeof import("@/lib/scope-service").applyKeyUserScope;
  let getKeyUserScope: typeof import("@/lib/scope-service").getKeyUserScope;
  let invalidateScopeCache: typeof import("@/lib/scope-service").invalidateScopeCache;

  beforeEach(async () => {
    mockFindUnique.mockReset();
    const mod = await import("@/lib/scope-service");
    applyKeyUserScope = mod.applyKeyUserScope;
    getKeyUserScope = mod.getKeyUserScope;
    invalidateScopeCache = mod.invalidateScopeCache;
    // مسح الكاش بين الاختبارات
    invalidateScopeCache();
  });

  it("يُرجع null عندما لا يوجد مفتاح مرتبط بالمستخدم", async () => {
    mockFindUnique.mockResolvedValue(null);
    const result = await getKeyUserScope("user-no-key");
    expect(result).toBeNull();
  });

  it("يُرجع keyId عند وجود مفتاح مرتبط", async () => {
    mockFindUnique.mockResolvedValue({ electionKeyId: "key-123" });
    const result = await getKeyUserScope("user-with-key");
    expect(result).toEqual({
      keyId: "key-123",
      voterWhere: { keyId: "key-123" },
      serviceWhere: { keyId: "key-123" },
      taskWhere: { electoralKeyId: "key-123" },
    });
  });

  it("applyKeyUserScope يُقيّد where لـ KEY_USER", async () => {
    mockFindUnique.mockResolvedValue({ electionKeyId: "key-abc" });
    const where: Record<string, unknown> = {};
    const result = await applyKeyUserScope(where, {
      role: "KEY_USER",
      userId: "user-abc",
    });
    expect(result).toBe(true);
    expect(where.keyId).toBe("key-abc");
  });

  it("applyKeyUserScope لا يُقيّد ADMIN", async () => {
    const where: Record<string, unknown> = {};
    const result = await applyKeyUserScope(where, {
      role: "ADMIN",
      userId: "admin-id",
    });
    expect(result).toBe(true);
    expect(where.keyId).toBeUndefined();
    // يجب ألا يُستدعى prisma أصلاً
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("applyKeyUserScope يضع 'none' عندما KEY_USER بلا مفتاح", async () => {
    mockFindUnique.mockResolvedValue(null);
    const where: Record<string, unknown> = {};
    const result = await applyKeyUserScope(where, {
      role: "KEY_USER",
      userId: "user-no-key",
    });
    expect(result).toBe(false);
    expect(where.keyId).toBe("none");
  });
});

// === اختبارات الأدوار والصلاحيات ===
describe("RBAC permissions", () => {
  // Import from security.ts
  let hasPermission: any;
  let ROLE_PERMISSIONS: any;

  beforeEach(async () => {
    const mod = await import("@/lib/security");
    hasPermission = mod.hasPermission;
    ROLE_PERMISSIONS = mod.ROLE_PERMISSIONS;
  });

  it("ADMIN لديه صلاحية delete", () => {
    expect(hasPermission("ADMIN", "delete")).toBe(true);
  });

  it("ADMIN لديه صلاحية manage_users", () => {
    expect(hasPermission("ADMIN", "manage_users")).toBe(true);
  });

  it("KEY_USER ليس لديه صلاحية delete", () => {
    expect(hasPermission("KEY_USER", "delete")).toBe(false);
  });

  it("KEY_USER لديه صلاحية write", () => {
    expect(hasPermission("KEY_USER", "write")).toBe(true);
  });

  it("OBSERVER لديه صلاحية read فقط", () => {
    expect(hasPermission("OBSERVER", "read")).toBe(true);
    expect(hasPermission("OBSERVER", "write")).toBe(false);
    expect(hasPermission("OBSERVER", "delete")).toBe(false);
    expect(hasPermission("OBSERVER", "manage_users")).toBe(false);
  });

  it("دور غير معروف ليس لديه أي صلاحية", () => {
    expect(hasPermission("HACKER", "read")).toBe(false);
    expect(hasPermission("HACKER", "write")).toBe(false);
  });
});

// === اختبارات سياسة كلمات المرور ===
describe("Password validation", () => {
  let validatePassword: any;

  beforeEach(async () => {
    const mod = await import("@/lib/security");
    validatePassword = mod.validatePassword;
  });

  it("يقبل كلمة مرور قوية", () => {
    const result = validatePassword("StrongP@ss123");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("يرفض كلمة مرور أقل من 8 أحرف", () => {
    const result = validatePassword("Ab1");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("يرفض كلمة مرور بدون أرقام", () => {
    const result = validatePassword("StrongPassword");
    expect(result.valid).toBe(false);
  });

  it("يرفض كلمة مرور بدون أحرف", () => {
    const result = validatePassword("12345678");
    expect(result.valid).toBe(false);
  });

  it("يرفض كلمات مرور شائعة", () => {
    const result = validatePassword("password123");
    expect(result.valid).toBe(false);
  });
});

// === اختبارات تنقية المدخلات ===
describe("Input sanitization", () => {
  let sanitizeString: any;
  let isValidCuid: any;
  let isValidPhone: any;

  beforeEach(async () => {
    const mod = await import("@/lib/security");
    sanitizeString = mod.sanitizeString;
    isValidCuid = mod.isValidCuid;
    isValidPhone = mod.isValidPhone;
  });

  it("يزيل وسوم HTML", () => {
    const result = sanitizeString("<script>alert('xss')</script>Hello");
    expect(result).toBe("alert('xss')Hello");
    expect(result).not.toContain("<script>");
  });

  it("يقطع النص الطويل", () => {
    const longText = "a".repeat(2000);
    const result = sanitizeString(longText);
    expect(result.length).toBeLessThanOrEqual(1000);
  });

  it("يرجع string فارغ لمدخلات غير نصية", () => {
    expect(sanitizeString(null)).toBe("");
    expect(sanitizeString(undefined)).toBe("");
    expect(sanitizeString(123)).toBe("");
  });

  it("يتحقق من صحة CUID", () => {
    expect(isValidCuid("cm5abc123def456ghi789jkl")).toBe(true);
    expect(isValidCuid("not-a-cuid")).toBe(false);
    expect(isValidCuid("")).toBe(false);
    expect(isValidCuid(null)).toBe(false);
  });

  it("يتحقق من صحة رقم الهاتف العراقي", () => {
    expect(isValidPhone("07712345678")).toBe(true);
    expect(isValidPhone("07812345678")).toBe(true);
    expect(isValidPhone("1234567890")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});
