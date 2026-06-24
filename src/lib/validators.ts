// ====================================================================
// مدققات Zod — عقود آمنة الأنواع لكل نقطة دخول API
// Type-safe contracts validated at runtime before any DB transaction
// ====================================================================

import { z } from "zod";

// ===== العشائر =====
export const createTribeSchema = z.object({
  name: z.string().min(1, "اسم العشيرة مطلوب").max(200),
  description: z.string().max(2000).optional().nullable(),
});

export const updateTribeSchema = createTribeSchema.partial();

export const createSubTribeSchema = z.object({
  name: z.string().min(2, "اسم الفخذ قصير جداً").max(100),
  tribeId: z.string().min(1),
});

// ===== المفاتيح الانتخابية =====
export const createElectionKeySchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(100),
  fatherName: z.string().max(100).optional().default(""),
  grandfatherName: z.string().max(100).optional().default(""),
  fourthName: z.string().max(100).optional().default(""),
  gender: z.string().default("ذكر"),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional().default(""),
  education: z.string().max(100).optional().default(""),
  profession: z.string().max(100).optional().default(""),
  district: z.string().max(100).optional().default(""),
  subDistrict: z.string().max(100).optional().default(""),
  pollingCenter: z.string().max(100).optional().default(""),
  expectedVotes: z.number().default(0),
  influenceLevel: z.number().int().min(1).max(5).default(3),
  mobilizationCap: z.number().int().min(1).max(5).default(3),
  loyaltyScore: z.number().int().min(1).max(5).default(3),
  riskLevel: z.number().int().min(1).max(5).default(1),
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
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  firstContactDate: z.string().optional().nullable(),
  lastContactDate: z.string().optional().nullable(),
  lastSpentDate: z.string().optional().nullable(),
  trainingStatus: z.string().optional().nullable(),
  dataAccuracy: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),

  // الأصوات
  totalVotes: z.number().int().default(0),
  supportedVotes: z.number().int().default(0),
  neutralVotes: z.number().int().default(0),
  weakVotes: z.number().int().default(0),
  netVotes: z.number().int().default(0),

  // التقييمات التسعة
  voteProtection: z.number().int().min(1).max(5).default(3),
  supportReason: z.number().int().min(1).max(5).default(3),
  needsLevel: z.number().int().min(1).max(5).default(3),
  politicalNote: z.number().int().min(1).max(5).default(3),
  organizationalNote: z.number().int().min(1).max(5).default(3),
  generalNote: z.number().int().min(1).max(5).default(3),

  // الدرجة المرجّحة والتصنيف
  weightedScore: z.number().default(0),
  classification: z.string().default("مقبول"),

  // المؤشرات المركبة
  eiiScore: z.number().default(0),
  kriScore: z.number().default(0),
  vpsScore: z.number().default(0),
  drsScore: z.number().default(0),
  campaignROI: z.number().default(0),

  // مالية
  totalSpent: z.number().default(0),
  monthlyBudget: z.number().default(0),
  totalInvestment: z.number().default(0),
  costPerVote: z.number().default(0),
});

export const updateElectionKeySchema = createElectionKeySchema.partial();

// ===== الناخبون =====
export const createVoterSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب").max(100),
  fatherName: z.string().max(100).optional().default(""),
  grandfatherName: z.string().max(100).optional().default(""),
  fourthName: z.string().max(100).optional().default(""),
  gender: z.string().default("ذكر"),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional().nullable(),
  nationalId: z.string().max(50).optional().nullable(),
  district: z.string().max(100).optional().default(""),
  subDistrict: z.string().max(100).optional().default(""),
  area: z.string().max(200).optional().nullable(),
  pollingCenter: z.string().max(100).optional().default(""),
  ballotStation: z.string().max(100).optional().default(""),
  keyId: z.string().optional().nullable(),
  tribeId: z.string().optional().nullable(),
  subTribeId: z.string().optional().nullable(),
  status: z.string().default("NEUTRAL"),
  supportDegree: z.number().int().min(1).max(5).default(3),
  supportReason: z.string().max(500).optional().nullable(),
  profession: z.string().max(100).optional().nullable(),
  education: z.string().max(100).optional().nullable(),
  specialization: z.string().max(100).optional().nullable(),
  maritalStatus: z.string().max(50).optional().nullable(),
  familySize: z.number().default(1),
  relationship: z.string().max(100).optional().nullable(),
  influenceRate: z.number().default(50),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  gpsVerified: z.boolean().default(false),
  socialMedia: z.string().max(2000).optional().nullable(),
  checkedIn: z.boolean().default(false),
  checkedInAt: z.string().optional().nullable(),
});

export const updateVoterSchema = createVoterSchema.partial();

// ===== تسجيل الحضور (idempotent) =====
export const checkinSchema = z.object({
  voterId: z.string().min(1, "معرف الناخب مطلوب"),
});

// ===== الخدمات =====
export const createServiceSchema = z.object({
  title: z.string().max(300).default(""),
  description: z.string().default(""),
  category: z.string().default("أخرى"),
  priority: z.string().default("NORMAL"),
  status: z.string().default("PENDING"),
  cost: z.number().default(0),
  estimatedVotesImpact: z.number().default(0),
  assignedTo: z.string().optional().nullable(),
  keyId: z.string().optional().nullable(),
  voterId: z.string().optional().nullable(),
});

export const updateServiceSchema = z.object({
  id: z.string().default(""),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional().nullable(),
  cost: z.number().optional(),
  estimatedVotesImpact: z.number().optional(),
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
