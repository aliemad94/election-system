// ====================================================================
// مدققات Zod — عقود آمنة الأنواع لكل نقطة دخول API
// Type-safe contracts validated at runtime before any DB transaction
// ====================================================================

import { z } from "zod";

// ===== العشائر =====
export const createTribeSchema = z.object({
  name: z.string().min(2, "اسم العشيرة قصير جداً").max(100),
  description: z.string().max(500).optional().nullable(),
});

export const updateTribeSchema = createTribeSchema.partial();

export const createSubTribeSchema = z.object({
  name: z.string().min(2, "اسم الفخذ قصير جداً").max(100),
  tribeId: z.string().min(1),
});

// ===== المفاتيح الانتخابية =====
export const createElectionKeySchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(50),
  fatherName: z.string().min(1, "اسم الأب مطلوب").max(50),
  grandfatherName: z.string().max(50).optional().default(""),
  fourthName: z.string().max(50).optional().default(""),
  gender: z.enum(["ذكر", "أنثى"]).default("ذكر"),
  dateOfBirth: z.string().optional(),
  phone: z
    .string()
    .min(1, "رقم الهاتف مطلوب")
    .regex(/^07[3-9]\d{8}$/, "رقم هاتف عراقي غير صالح (مثال: 07701234567)"),
  education: z.string().max(100).optional().default(""),
  profession: z.string().max(100).optional().default(""),
  district: z.string().min(1).default("الغراف"),
  subDistrict: z.string().max(100).optional().default(""),
  pollingCenter: z.string().max(100).optional().default(""),
  expectedVotes: z.number().int().min(0).max(100000).default(0),
  influenceLevel: z.number().int().min(1).max(5).default(3),
  mobilizationCap: z.number().int().min(1).max(5).default(3),
  loyaltyScore: z.number().int().min(1).max(5).default(3),
  riskLevel: z.number().int().min(1).max(5).default(1),
  tribeId: z.string().optional().nullable(),
  socialMedia: z.string().max(2000).optional().nullable(),
});

export const updateElectionKeySchema = createElectionKeySchema.partial();

// ===== الناخبون =====
export const createVoterSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(50),
  fatherName: z.string().min(1, "اسم الأب مطلوب").max(50),
  grandfatherName: z.string().max(50).optional().default(""),
  fourthName: z.string().max(50).optional().default(""),
  gender: z.enum(["ذكر", "أنثى"]).default("ذكر"),
  dateOfBirth: z.string().optional(),
  phone: z
    .string()
    .regex(/^07[3-9]\d{8}$/)
    .optional()
    .nullable(),
  nationalId: z.string().max(50).optional().nullable(),
  district: z.string().min(1).default("الغراف"),
  subDistrict: z.string().max(100).optional().default(""),
  area: z.string().max(200).optional().nullable(),
  pollingCenter: z.string().max(100).optional().default(""),
  ballotStation: z.string().max(100).optional().default(""),
  keyId: z.string().min(1, "المفتاح الانتخابي مطلوب"),
  tribeId: z.string().optional().nullable(),
  subTribeId: z.string().optional().nullable(),
  status: z.enum(["SUPPORTED", "NEUTRAL", "WEAK"]).default("NEUTRAL"),
  supportDegree: z.number().int().min(1).max(5).default(3),
  supportReason: z.string().max(500).optional().nullable(),
  profession: z.string().max(100).optional().nullable(),
  education: z.string().max(100).optional().nullable(),
  maritalStatus: z.string().max(50).optional().nullable(),
  familySize: z.number().int().min(1).max(50).optional().nullable(),
  relationship: z.string().max(100).optional().nullable(),
  influenceRate: z.number().int().min(0).max(100).default(50),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  gpsVerified: z.boolean().default(false),
  socialMedia: z.string().max(2000).optional().nullable(),
});

export const updateVoterSchema = createVoterSchema.partial();

// ===== تسجيل الحضور (idempotent) =====
export const checkinSchema = z.object({
  voterId: z.string().min(1, "معرف الناخب مطلوب"),
});

// ===== الخدمات =====
export const createServiceSchema = z.object({
  title: z.string().min(2, "عنوان الخدمة مطلوب").max(200),
  description: z.string().max(1000).default(""),
  category: z
    .enum(["صحي", "توظيف", "رصف", "مساعدات", "كهرباء", "مياه", "أخرى"])
    .default("أخرى"),
  priority: z.enum(["URGENT", "HIGH", "NORMAL", "LOW"]).default("NORMAL"),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .default("PENDING"),
  cost: z.number().min(0).default(0),
  estimatedVotesImpact: z.number().int().min(0).default(0),
  assignedTo: z.string().max(100).optional().nullable(),
  keyId: z.string().optional().nullable(),
  voterId: z.string().optional().nullable(),
});

export const updateServiceSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
    .optional(),
  priority: z.enum(["URGENT", "HIGH", "NORMAL", "LOW"]).optional(),
  assignedTo: z.string().max(100).optional().nullable(),
  cost: z.number().min(0).optional(),
  estimatedVotesImpact: z.number().int().min(0).optional(),
});

// ===== أدوات مساعدة =====
export type CreateTribeInput = z.infer<typeof createTribeSchema>;
export type CreateElectionKeyInput = z.infer<typeof createElectionKeySchema>;
export type CreateVoterInput = z.infer<typeof createVoterSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;

/**
 * تنسيق خطأ Zod لرسالة عربية موحّدة
 */
export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  return first?.message || "بيانات غير صالحة";
}
