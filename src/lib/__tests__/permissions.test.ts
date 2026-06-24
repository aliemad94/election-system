import { describe, it, expect } from "vitest";
import { canEdit, canDelete, canBulkAction, type Role } from "../permissions";

describe("permissions — مصفوفة صلاحيات الأدوار", () => {
  describe("ADMIN", () => {
    it("تعديل", () => expect(canEdit("ADMIN")).toBe(true));
    it("حذف", () => expect(canDelete("ADMIN")).toBe(true));
    it("عمليات جماعية", () => expect(canBulkAction("ADMIN")).toBe(true));
  });
  describe("KEY_USER — الفرق الحرج عن ADMIN", () => {
    it("يملك التعديل", () => expect(canEdit("KEY_USER")).toBe(true));
    it("لا يملك الحذف", () => expect(canDelete("KEY_USER")).toBe(false));
    it("لا يملك العمليات الجماعية", () => expect(canBulkAction("KEY_USER")).toBe(false));
  });
  describe("OBSERVER — قراءة فقط", () => {
    it("لا تعديل", () => expect(canEdit("OBSERVER")).toBe(false));
    it("لا حذف", () => expect(canDelete("OBSERVER")).toBe(false));
    it("لا عمليات جماعية", () => expect(canBulkAction("OBSERVER")).toBe(false));
  });
  it("مصفوفة الصلاحيات الكاملة صحيحة", () => {
    const m: Record<Role, { e: boolean; d: boolean; b: boolean }> = {
      ADMIN: { e: true, d: true, b: true },
      KEY_USER: { e: true, d: false, b: false },
      OBSERVER: { e: false, d: false, b: false },
    };
    (Object.keys(m) as Role[]).forEach((r) => {
      expect(canEdit(r)).toBe(m[r].e);
      expect(canDelete(r)).toBe(m[r].d);
      expect(canBulkAction(r)).toBe(m[r].b);
    });
  });
  it("الحذف حصري لـ ADMIN", () => {
    (["KEY_USER", "OBSERVER"] as Role[]).forEach((r) => {
      expect(canDelete(r)).toBe(false);
      expect(canBulkAction(r)).toBe(false);
    });
  });
});
