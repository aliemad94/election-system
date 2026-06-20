// ====================================================================
// أنواع مشتركة للواجهة الأمامية والخلفية
// Shared types for frontend & backend contracts
// ====================================================================

export interface AuthenticatedUser {
  userId: string;
  role: "ADMIN" | "KEY_USER" | "OBSERVER";
  username: string;
}

// معرّفات الصفحات للتنقل
export type PageId =
  | "dashboard"
  | "tribes"
  | "electoral-keys"
  | "voters"
  | "services"
  | "competitors"
  | "commission"
  | "volunteers"
  | "tasks"
  | "public-opinion"
  | "early-warnings"
  | "data-analysis"
  | "advanced-indicators"
  | "warroom"
  | "fieldagent"
  | "comms"
  | "sms";

// أقضية محافظة ذي قار الـ21
export const DHIQAR_DISTRICTS = [
  "الناصرية",
  "الشطرة",
  "سوق الشيوخ",
  "الرفاعي",
  "الجبايش",
  "قلعة سكر",
  "الغراف",
  "النصر",
  "الفجر",
  "الفهود",
  "البطحاء",
  "سيد دخيل",
  "الإصلاح",
  "الدواية",
  "الفضلية",
  "العكيكة",
  "الطار",
  "كرمة بني سعيد",
  "أور",
  "المنار",
  "الحمار",
] as const;

export const GENDERS = ["ذكر", "أنثى"] as const;
export const VOTER_STATUSES = ["SUPPORTED", "NEUTRAL", "WEAK"] as const;
export const SERVICE_CATEGORIES = [
  "صحي",
  "توظيف",
  "رصف",
  "مساعدات",
  "كهرباء",
  "مياه",
  "أخرى",
] as const;
export const SERVICE_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export const SERVICE_PRIORITIES = ["URGENT", "HIGH", "NORMAL", "LOW"] as const;

// عشائر مرجعية (للاختيار السريع)
export const REFERENCE_TRIBES = [
  "آل شمارة",
  "بني خالد",
  "الخزاعل",
  "بني ركاب",
  "آل ياسين",
  "السعدون",
  "بني زريج",
  "العوائد",
  "الصريّفين",
  "بني تميم",
] as const;

// ===== أنواع الاستجابة =====
export interface VoterDTO {
  id: string;
  fullName: string;
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  fourthName: string;
  gender: string;
  phone: string;
  nationalId: string | null;
  district: string;
  subDistrict: string;
  pollingCenter: string;
  ballotStation: string;
  status: string;
  supportDegree: number;
  supportReason: string | null;
  votedOnDay: boolean;
  keyId: string;
  tribeId: string | null;
  tribeName: string;
  relationship: string | null;
  influenceRate: number;
  lastContactDate: string | null;
  createdAt: string;
}

export interface ElectoralKeyDTO {
  id: string;
  keyCode: string;
  fullName: string;
  firstName: string;
  fatherName: string;
  phone: string;
  gender: string;
  district: string;
  subDistrict: string;
  pollingCenter: string;
  expectedVotes: number;
  influenceLevel: number;
  mobilizationCap: number;
  loyaltyScore: number;
  riskLevel: number;
  tribeId: string | null;
  tribeName: string;
  voterCount: number;
  createdAt: string;
}

export interface TribeDTO {
  id: string;
  name: string;
  description: string | null;
  voterCount: number;
  votedCount: number;
  votedPercentage: number;
  subTribeCount: number;
}

export interface ServiceDTO {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  cost: number;
  estimatedVotesImpact: number;
  assignedTo: string;
  keyId: string | null;
  voterId: string | null;
  createdAt: string;
}

