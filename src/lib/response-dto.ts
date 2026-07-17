// ====================================================================
// كائنات نقل البيانات لحماية الخصوصية (Privacy-Preserving DTOs)
// ====================================================================

export interface MaskedVoter {
  id: string;
  fullName: string;
  firstName: string;
  fatherName: string | null;
  grandfatherName: string | null;
  fourthName: string | null;
  gender: string;
  phone: string;
  phoneNumber: string;
  nationalId?: string | null;
  district: string | null;
  subDistrict: string | null;
  area: string;
  pollingCenter: string | null;
  ballotStation: string | null;
  status: string;
  supportDegree: number;
  confidenceScore: number;
  supportReason: string | null;
  votedOnDay: boolean;
  votedStatus: boolean;
  checkedIn: boolean;
  checkedInAt: string | null;
  keyId: string | null;
  electoralKeyId: string | null;
  keyCode: string;
  electoralKey: any;
  electionKey: any;
  tribeId: string | null;
  tribeName: string;
  tribe: any;
  subTribeId: string | null;
  subTribeName: string;
  profession: string | null;
  education: string | null;
  specialization: string | null;
  maritalStatus: string | null;
  familySize: number | null;
  relationship: string | null;
  influenceRate: number;
  latitude: number | null;
  gpsVerified: boolean;
  socialMedia: string | null;
  version: number;
}

export function maskName(
  firstName: string,
  fatherName: string | null | undefined,
  grandfatherName: string | null | undefined,
  fourthName: string | null | undefined,
  role: string
) {
  if (role === "OBSERVER") {
    return {
      fullName: `${firstName} ***`,
      firstName: firstName,
      fatherName: "***",
      grandfatherName: "***",
      fourthName: "***",
    };
  }
  return {
    fullName: [firstName, fatherName, grandfatherName, fourthName]
      .filter(Boolean)
      .join(" ")
      .trim(),
    firstName,
    fatherName: fatherName || null,
    grandfatherName: grandfatherName || null,
    fourthName: fourthName || null,
  };
}

export function maskPhone(phone: string | null | undefined, role: string): string {
  if (!phone) return "";
  if (role === "OBSERVER") {
    const clean = phone.trim();
    if (clean.length <= 6) return "***";
    return clean.substring(0, 3) + "****" + clean.substring(clean.length - 3);
  }
  // لـ KEY_USER و ADMIN يُرجع كاملاً
  return phone;
}

export function maskNationalId(nationalId: string | null | undefined, role: string): string | null | undefined {
  if (!nationalId) return null;
  if (role === "ADMIN") {
    return nationalId;
  }
  if (role === "KEY_USER") {
    return "***";
  }
  if (role === "OBSERVER") {
    return "***";
  }
  return undefined;
}

/**
 * تحويل ناخب من قاعدة البيانات إلى كائن DTO مقنّع بناءً على دور المستخدم.
 */
export function toVoterDTO(v: any, role: string): MaskedVoter {
  const nameFields = maskName(
    v.firstName,
    v.fatherName,
    v.grandfatherName,
    v.fourthName,
    role
  );

  const phoneVal = maskPhone(v.phone, role);
  const nationalIdVal = maskNationalId(v.nationalId, role);

  const electionKeyVal = v.electionKey ? {
    id: v.electionKey.id || v.keyId || "",
    code: v.electionKey.keyCode || v.electionKey.code || "",
    keyCode: v.electionKey.keyCode || v.electionKey.code || "",
    firstName: role === "OBSERVER" ? v.electionKey.firstName : (v.electionKey.firstName || ""),
    fatherName: role === "OBSERVER" ? "***" : (v.electionKey.fatherName || null),
  } : null;

  return {
    id: v.id,
    ...nameFields,
    gender: v.gender,
    phone: phoneVal,
    phoneNumber: phoneVal,
    nationalId: nationalIdVal,
    district: v.district,
    subDistrict: v.subDistrict,
    area: v.area || v.subDistrict || "",
    pollingCenter: v.pollingCenter,
    ballotStation: v.ballotStation,
    status: v.status || "NEUTRAL",
    supportDegree: v.supportDegree || 3,
    confidenceScore: v.supportDegree || 3,
    supportReason: role === "OBSERVER" ? null : (v.supportReason || null),
    votedOnDay: v.votedOnDay || false,
    votedStatus: v.votedOnDay || false,
    checkedIn: v.checkedIn || false,
    checkedInAt: v.checkedInAt ? (v.checkedInAt instanceof Date ? v.checkedInAt : new Date(v.checkedInAt)).toISOString() : null,
    keyId: v.keyId,
    electoralKeyId: v.keyId,
    keyCode: v.electionKey?.keyCode || v.electionKey?.code || "",
    electoralKey: electionKeyVal,
    electionKey: electionKeyVal,
    tribeId: v.tribeId,
    tribeName: v.tribe?.name || "غير محدد",
    tribe: v.tribe ? {
      id: v.tribe.id,
      name: v.tribe.name,
      influence: v.tribe.influenceRating || 3,
    } : null,
    subTribeId: v.subTribeId,
    subTribeName: v.subTribe?.name || "غير محدد",
    profession: role === "OBSERVER" ? null : (v.profession || null),
    education: role === "OBSERVER" ? null : (v.education || null),
    specialization: role === "OBSERVER" ? null : (v.specialization || null),
    maritalStatus: role === "OBSERVER" ? null : (v.maritalStatus || null),
    familySize: role === "OBSERVER" ? null : (v.familySize || null),
    relationship: role === "OBSERVER" ? null : (v.relationship || null),
    influenceRate: v.influenceRate || 1,
    latitude: role === "OBSERVER" ? null : (v.latitude || null),
    gpsVerified: v.gpsVerified || false,
    socialMedia: role === "OBSERVER" ? null : (v.socialMedia || null),
    version: v.version || 1,
  };
}

/**
 * تحويل مفتاح انتخابي إلى كائن DTO مقنّع بناءً على دور المستخدم.
 */
export function toElectionKeyDTO(k: any, role: string) {
  if (!k) return null;
  const votersCount = k.voters ? k.voters.length : (k._count?.voters ?? 0);
  const isObserver = role === "OBSERVER";

  const firstName = k.firstName;
  const fatherName = isObserver ? "***" : (k.fatherName || "");
  const grandfatherName = isObserver ? "***" : (k.grandfatherName || "");
  const fourthName = isObserver ? "***" : (k.fourthName || "");

  const fullName = [firstName, fatherName, grandfatherName, fourthName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const phoneVal = maskPhone(k.phone, role);

  return {
    id: k.id,
    code: k.keyCode,
    keyCode: k.keyCode,
    fullName,
    firstName,
    fatherName: isObserver ? "***" : (k.fatherName || null),
    grandfatherName: isObserver ? "***" : (k.grandfatherName || null),
    fourthName: isObserver ? "***" : (k.fourthName || null),
    gender: k.gender,
    phone: phoneVal,
    district: k.district,
    subDistrict: k.subDistrict,
    area: k.subDistrict,
    pollingCenter: k.pollingCenter,
    dateOfBirth: isObserver ? null : (k.birthDate ? (k.birthDate instanceof Date ? k.birthDate : new Date(k.birthDate)).toISOString().split("T")[0] : null),
    education: isObserver ? null : (k.education || ""),
    educationLevel: isObserver ? null : (k.education || ""),
    expectedVotes: k.expectedVotes || 0,
    totalVotes: k.totalVotes !== undefined && k.totalVotes !== null ? k.totalVotes : (k.expectedVotes || 0),
    influenceLevel: k.influenceLevel || 3,
    mobilizationCap: k.mobilizationCap || 3,
    mobilizationAbility: k.mobilizationCap || 3,
    loyaltyScore: k.loyaltyScore || 3,
    loyaltyLevel: k.loyaltyScore || 3,
    riskLevel: k.riskLevel || 1,
    tribeId: k.tribeId || null,
    tribeName: k.tribe?.name || "غير محدد",
    voterCount: votersCount,
    createdAt: k.createdAt ? (k.createdAt instanceof Date ? k.createdAt : new Date(k.createdAt)).toISOString() : null,
    profession: isObserver ? null : (k.profession || null),
    socialMedia: isObserver ? null : (k.socialMedia || null),
    nickname: isObserver ? null : (k.nickname || null),
    phone2: isObserver ? null : (maskPhone(k.phone2, role) || null),
    email: isObserver ? null : (k.email || null),
    address: isObserver ? null : (k.address || null),
    neighborhood: isObserver ? null : (k.neighborhood || null),
    pollingStation: k.pollingStation || null,
    age: isObserver ? null : (k.age || null),
    specialization: isObserver ? null : (k.specialization || null),
    maritalStatus: isObserver ? null : (k.maritalStatus || null),
    familySize: isObserver ? null : (k.familySize || null),
    notes: isObserver ? null : (k.notes || null),
    isActive: k.isActive !== undefined ? k.isActive : true,
    firstContactDate: isObserver ? null : (k.firstContactDate ? (k.firstContactDate instanceof Date ? k.firstContactDate : new Date(k.firstContactDate)).toISOString() : null),
    lastContactDate: isObserver ? null : (k.lastContactDate ? (k.lastContactDate instanceof Date ? k.lastContactDate : new Date(k.lastContactDate)).toISOString() : null),
    lastSpentDate: isObserver ? null : (k.lastSpentDate ? (k.lastSpentDate instanceof Date ? k.lastSpentDate : new Date(k.lastSpentDate)).toISOString() : null),
    trainingStatus: isObserver ? null : (k.trainingStatus || null),
    dataAccuracy: isObserver ? null : (k.dataAccuracy || null),
    createdBy: k.createdBy || null,
    lastEvaluationAt: isObserver ? null : (k.lastEvaluationAt ? (k.lastEvaluationAt instanceof Date ? k.lastEvaluationAt : new Date(k.lastEvaluationAt)).toISOString() : null),

    // الأصوات
    supportedVotes: k.supportedVotes || 0,
    neutralVotes: k.neutralVotes || 0,
    weakVotes: k.weakVotes || 0,
    netVotes: k.netVotes || 0,

    // التقييمات
    voteProtection: k.voteProtection || 3,
    supportReason: k.supportReason || 3,
    needsLevel: k.needsLevel || 3,
    politicalNote: k.politicalNote || 3,
    organizationalNote: k.organizationalNote || 3,
    generalNote: k.generalNote || 3,

    // الدرجات
    weightedScore: k.weightedScore || 0,
    classification: k.classification || "مقبول",
    eiiScore: k.eiiScore || 0,
    kriScore: k.kriScore || 0,
    vpsScore: k.vpsScore || 0,
    drsScore: k.drsScore || 0,
    campaignROI: k.campaignROI || 0,

    // مالية
    totalSpent: isObserver ? 0 : (k.totalSpent || 0),
    monthlyBudget: isObserver ? 0 : (k.monthlyBudget || 0),
    totalInvestment: isObserver ? 0 : (k.totalInvestment || 0),
    costPerVote: isObserver ? 0 : (k.costPerVote || 0),
  };
}
