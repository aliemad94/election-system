// ====================================================================
// مدققات Zod — عقود آمنة الأنواع لكل نقطة دخول API
// Type-safe contracts validated at runtime before any DB transaction
// ====================================================================

import { z } from "zod";
import { sanitizeString } from "./security";
import { NextRequest } from "next/server";

/** Normalize Iraqi mobile numbers before storage and unique-index checks. */
export function normalizeIraqiPhoneForStorage(value: string): string {
  const compact = value.replace(/[\s()\-]/g, "");
  if (compact.startsWith("+9647")) return `0${compact.slice(4)}`;
  if (compact.startsWith("9647")) return `0${compact.slice(3)}`;
  return compact;
}

// ===== العشائر =====
export const createTribeSchema = z.object({
  name: z.string().min(1, "اسم العشيرة مطلوب").max(200),
  description: z.string().max(2000).optional().nullable().transform(val => val === null || val === undefined ? val : sanitizeString(val)),
  leaderName: z.string().max(200).optional().nullable(),
  leaderPhone: z.string().max(50).optional().nullable(),
  district: z.string().max(100).optional().nullable(),
  influence: z.number().int().min(1).max(5).optional().default(3),
  notes: z.string().max(2000).optional().nullable().transform(val => val === null || val === undefined ? val : sanitizeString(val)),
});

export const updateTribeSchema = createTribeSchema.partial();

export const createSubTribeSchema = z.object({
  name: z.string().min(2, "اسم الفخذ قصير جداً").max(100),
  tribeId: z.string().min(1),
});

// ===== المفاتيح الانتخابية =====
export const electionKeyBaseSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(100),
  fatherName: z.string().max(100).optional(),
  grandfatherName: z.string().max(100).optional(),
  fourthName: z.string().max(100).optional(),
  gender: z.enum(["ذكر", "أنثى"]).optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  education: z.string().max(100).optional(),
  profession: z.string().max(100).optional(),
  district: z.string().max(100).optional(),
  subDistrict: z.string().max(100).optional(),
  pollingCenter: z.string().max(100).optional(),
  expectedVotes: z.number().optional(),
  influenceLevel: z.number().int().min(1).max(5).optional(),
  mobilizationCap: z.number().int().min(1).max(5).optional(),
  loyaltyScore: z.number().int().min(1).max(5).optional(),
  riskLevel: z.number().int().min(1).max(5).optional(),
  tribeId: z.string().optional().nullable(),
  socialMedia: z.string().max(2000).optional().nullable(),

  // === حقول إضافية تمت ترقيتها للتوافق الشامل ===
  nickname: z.string().optional().nullable(),
  phone2: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  pollingStation: z.string().optional().nullable(),
  age: z.number().int().optional().nullable(),
  specialization: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  familySize: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable().transform(val => val === null || val === undefined ? val : sanitizeString(val)),
  isActive: z.boolean().optional(),
  firstContactDate: z.string().optional().nullable(),
  lastContactDate: z.string().optional().nullable(),
  lastSpentDate: z.string().optional().nullable(),
  trainingStatus: z.string().optional().nullable(),
  dataAccuracy: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),

  // الأصوات
  totalVotes: z.number().int().min(0).optional(),
  supportedVotes: z.number().int().min(0).optional(),
  neutralVotes: z.number().int().min(0).optional(),
  weakVotes: z.number().int().min(0).optional(),
  netVotes: z.number().min(0).optional(),

  // التقييمات التسعة
  voteProtection: z.number().int().min(1).max(5).optional(),
  supportReason: z.number().int().min(1).max(5).optional(),
  needsLevel: z.number().int().min(1).max(5).optional(),
  politicalNote: z.number().int().min(1).max(5).optional(),
  organizationalNote: z.number().int().min(1).max(5).optional(),
  generalNote: z.number().int().min(1).max(5).optional(),

  // الدرجة المرجّحة والتصنيف
  weightedScore: z.number().optional(),
  classification: z.string().optional(),

  // المؤشرات المركبة
  eiiScore: z.number().optional(),
  kriScore: z.number().optional(),
  vpsScore: z.number().optional(),
  drsScore: z.number().optional(),
  campaignROI: z.number().optional(),

  // مالية
  totalSpent: z.number().optional(),
  monthlyBudget: z.number().optional(),
  totalInvestment: z.number().optional(),
  costPerVote: z.number().optional(),
});

export const createElectionKeySchema = electionKeyBaseSchema.extend({
  fatherName: z.string().max(100).optional().default(""),
  grandfatherName: z.string().max(100).optional().default(""),
  fourthName: z.string().max(100).optional().default(""),
  gender: z.enum(["ذكر", "أنثى"]).default("ذكر"),
  phone: z.string().optional().default(""),
  education: z.string().max(100).optional().default(""),
  profession: z.string().max(100).optional().default(""),
  district: z.string().max(100).optional().default(""),
  subDistrict: z.string().max(100).optional().default(""),
  pollingCenter: z.string().max(100).optional().default(""),
  expectedVotes: z.number().min(0).default(0),
  influenceLevel: z.number().int().min(1).max(5).default(3),
  mobilizationCap: z.number().int().min(1).max(5).default(3),
  loyaltyScore: z.number().int().min(1).max(5).default(3),
  riskLevel: z.number().int().min(1).max(5).default(1),
  isActive: z.boolean().default(true),
  totalVotes: z.number().int().min(0).default(0),
  supportedVotes: z.number().int().min(0).default(0),
  neutralVotes: z.number().int().min(0).default(0),
  weakVotes: z.number().int().min(0).default(0),
  netVotes: z.number().min(0).default(0),
  voteProtection: z.number().int().min(1).max(5).default(3),
  supportReason: z.number().int().min(1).max(5).default(3),
  needsLevel: z.number().int().min(1).max(5).default(3),
  politicalNote: z.number().int().min(1).max(5).default(3),
  organizationalNote: z.number().int().min(1).max(5).default(3),
  generalNote: z.number().int().min(1).max(5).default(3),
  weightedScore: z.number().default(0),
  classification: z.string().default("مقبول"),
  eiiScore: z.number().default(0),
  kriScore: z.number().default(0),
  vpsScore: z.number().default(0),
  drsScore: z.number().default(0),
  campaignROI: z.number().default(0),
  totalSpent: z.number().default(0),
  monthlyBudget: z.number().default(0),
  totalInvestment: z.number().default(0),
  costPerVote: z.number().default(0),
});

export const updateElectionKeySchema = electionKeyBaseSchema.partial();

// ===== الناخبون =====
export const voterBaseSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(100),
  fatherName: z.string().max(100).optional(),
  grandfatherName: z.string().max(100).optional(),
  fourthName: z.string().max(100).optional(),
  gender: z.enum(["ذكر", "أنثى"]).optional(),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional().nullable(),
  nationalId: z.string().max(50).optional().nullable(),
  district: z.string().max(100).optional(),
  subDistrict: z.string().max(100).optional(),
  area: z.string().max(200).optional().nullable(),
  pollingCenter: z.string().max(100).optional(),
  ballotStation: z.string().max(100).optional(),
  keyId: z.string().optional().nullable(),
  tribeId: z.string().optional().nullable(),
  subTribeId: z.string().optional().nullable(),
  status: z.enum(["SUPPORTED", "NEUTRAL", "WEAK"]).optional(),
  supportDegree: z.number().int().min(1).max(5).optional(),
  supportReason: z.string().max(500).optional().nullable().transform(val => val === null || val === undefined ? val : sanitizeString(val)),
  profession: z.string().max(100).optional().nullable(),
  education: z.string().max(100).optional().nullable(),
  specialization: z.string().max(100).optional().nullable(),
  maritalStatus: z.string().max(50).optional().nullable(),
  familySize: z.number().optional(),
  relationship: z.string().max(100).optional().nullable(),
  influenceRate: z.number().optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  gpsVerified: z.boolean().optional(),
  socialMedia: z.string().max(2000).optional().nullable(),
  checkedIn: z.boolean().optional(),
  checkedInAt: z.string().optional().nullable(),
  votedOnDay: z.boolean().optional(),
});

export const createVoterSchema = voterBaseSchema.extend({
  fatherName: z.string().max(100).optional().default(""),
  grandfatherName: z.string().max(100).optional().default(""),
  fourthName: z.string().max(100).optional().default(""),
  gender: z.enum(["ذكر", "أنثى"]).default("ذكر"),
  district: z.string().max(100).optional().default(""),
  subDistrict: z.string().max(100).optional().default(""),
  pollingCenter: z.string().max(100).optional().default(""),
  ballotStation: z.string().max(100).optional().default(""),
  status: z.enum(["SUPPORTED", "NEUTRAL", "WEAK"]).default("NEUTRAL"),
  supportDegree: z.number().int().min(1).max(5).default(3),
  familySize: z.number().default(1),
  influenceRate: z.number().default(50),
  gpsVerified: z.boolean().default(false),
  checkedIn: z.boolean().default(false),
});

export const updateVoterSchema = voterBaseSchema.partial();

// ===== تسجيل الحضور (idempotent) =====
export const checkinSchema = z.object({
  voterId: z.string().min(1, "معرف الناخب مطلوب"),
});

// ===== الخدمات =====
export const createServiceSchema = z.object({
  title: z.string().max(300).default(""),
  description: z.string().default("").transform(val => sanitizeString(val)),
  category: z.string().default("أخرى"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).default("PENDING"),
  cost: z.number().min(0).default(0),
  estimatedVotesImpact: z.number().min(0).default(0),
  assignedTo: z.string().optional().nullable(),
  keyId: z.string().optional().nullable(),
  voterId: z.string().optional().nullable(),
});

export const updateServiceSchema = z.object({
  id: z.string().default(""),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  assignedTo: z.string().optional().nullable(),
  cost: z.number().optional(),
  estimatedVotesImpact: z.number().optional(),
});

// ===== الإنذار المبكر =====
export const createEarlyWarningSchema = z.object({
  electoralKeyId: z.string().optional().nullable(),
  warningType: z.enum(["CONFIDENCE_DROP", "LOYALTY_CHANGE", "DEFECTION_RISK", "FIELD_ISSUE", "مهددة_خسارة", "متأرجحة", "مشاركة_منخفض", "مشاركة_منخفضة", "قابلة_لاختراق"]).default("FIELD_ISSUE"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL", "حرج", "مرتفع", "متوسط", "منخفض"]).default("MEDIUM"),
  description: z.string().min(1, "الوصف مطلوب"),
  status: z.enum(["ACTIVE", "IN_PROGRESS", "RESOLVED"]).default("ACTIVE"),
  areaType: z.string().optional().nullable(),
  areaName: z.string().min(1, "اسم المنطقة مطلوب"),
  estimatedVotesAtRisk: z.number().int().default(0),
  recommendedAction: z.string().optional().nullable(),
});

export const updateEarlyWarningSchema = createEarlyWarningSchema.partial();

// ===== أدوات مساعدة =====
export type CreateTribeInput = z.infer<typeof createTribeSchema>;
export type CreateElectionKeyInput = z.infer<typeof createElectionKeySchema>;
export type CreateVoterInput = z.infer<typeof createVoterSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type CreateEarlyWarningInput = z.infer<typeof createEarlyWarningSchema>;

/**
 * تنسيق خطأ Zod لرسالة عربية موحّدة ومعرّبة تلقائياً
 */
export function formatZodError(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "بيانات غير صالحة";

  const message = first.message;
  const pathName = first.path.join(".") || "الحقل";

  // تعريب الرسائل الافتراضية الشائعة من Zod
  if (message === "Required") {
    return `الحقل [${pathName}] مطلوب`;
  }
  if (message === "Invalid email") {
    return "البريد الإلكتروني المدخل غير صالح";
  }
  if (message.startsWith("Expected ") && message.includes("received")) {
    return `نوع البيانات المدخلة للحقل [${pathName}] غير صحيح`;
  }
  if (message.includes("Invalid enum value")) {
    return `القيمة المحددة للحقل [${pathName}] غير صالحة`;
  }
  if (message.includes("String must contain at least")) {
    return `النص في [${pathName}] قصير جداً`;
  }
  if (message.includes("Number must be greater than or equal to")) {
    return `القيمة الرقمية للحقل [${pathName}] يجب أن تكون أكبر أو تساوي الحد الأدنى`;
  }

  return message || "بيانات غير صالحة";
}

/**
 * تحليل وقراءة الـ request body بأمان لمنع الانهيارات عند إرسال JSON تالف أو فارغ
 */
export async function safeParseBody<T>(req: NextRequest): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
