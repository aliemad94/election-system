// ====================================================================
// /api/electoral-keys — المفاتيح الانتخابية (GET + POST مع كود تلقائي)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { createElectionKeySchema, formatZodError } from "@/lib/validators";
import { calculateAll } from "@/lib/electoral-calculations";
import { getKeyUserScope } from "@/lib/scope-service";

function mapElectionKeyToUI(k: any, userRole?: string) {
  if (!k) return null;
  const votersCount = k.voters ? k.voters.length : (k._count?.voters ?? 0);
  const isObserver = userRole === "OBSERVER";

  const firstName = k.firstName;
  const fatherName = isObserver ? "***" : (k.fatherName || "");
  const grandfatherName = isObserver ? "***" : (k.grandfatherName || "");
  const fourthName = isObserver ? "***" : (k.fourthName || "");

  const fullName = [firstName, fatherName, grandfatherName, fourthName]
    .filter(Boolean)
    .join(" ")
    .trim();

  let phoneVal = k.phone || "";
  if (isObserver && phoneVal) {
    phoneVal = phoneVal.substring(0, 3) + "****" + phoneVal.substring(phoneVal.length - 3);
  }

  let phone2Val = k.phone2 || null;
  if (isObserver && phone2Val) {
    phone2Val = "***";
  }

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
    area: k.subDistrict, // UI name mapping
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
    phone2: phone2Val,
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

// GET /api/electoral-keys — قائمة المفاتيح مع فلترة وبحث
async function getHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");
    const search = searchParams.get("search");
    const tribeId = searchParams.get("tribeId");

    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? parseInt(pageParam, 10) : null;
    const limit = limitParam ? parseInt(limitParam, 10) : null;

    const where: Record<string, unknown> = {};

    if (district && district !== "all") {
      where.district = district;
    }
    if (tribeId) {
      where.tribeId = tribeId;
    }

    // KEY_USER يرى مفتاحه فقط
    if (user.role === "KEY_USER") {
      const scope = await getKeyUserScope(user.userId);
      if (!scope) {
        return NextResponse.json(page && limit ? { keys: [], total: 0, page, limit } : []);
      }
      where.id = scope.keyId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { fatherName: { contains: q, mode: "insensitive" } },
        { grandfatherName: { contains: q, mode: "insensitive" } },
        { fourthName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { keyCode: { contains: q, mode: "insensitive" } },
      ];
    }

    const findOptions: any = {
      where,
      orderBy: { createdAt: "asc" },
      include: {
        tribe: { select: { name: true } },
        _count: { select: { voters: true } },
      },
    };

    if (page && limit) {
      findOptions.skip = (page - 1) * limit;
      findOptions.take = Math.min(limit, 100);
    } else {
      findOptions.take = 1000; // حد أقصى للحماية لمنع استنزاف الذاكرة
    }

    const [keys, total] = await Promise.all([
      prisma.electionKey.findMany(findOptions),
      prisma.electionKey.count({ where }),
    ]);

    const result = (keys as any[]).map((k) => mapElectionKeyToUI(k, user.role));

    if (page && limit) {
      return NextResponse.json({ keys: result, total, page, limit });
    }
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "electoral-keys-get");
  }
}

// POST /api/electoral-keys — إنشاء مفتاح مع توليد كود تلقائي (retry لمنع التضارب)
async function postHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await req.json();
    
    // Map UI names to DB names before Zod validation
    if (body.educationLevel !== undefined && body.education === undefined) {
      body.education = body.educationLevel;
    }
    if (body.area !== undefined && body.subDistrict === undefined) {
      body.subDistrict = body.area;
    }
    if (body.loyaltyLevel !== undefined && body.loyaltyScore === undefined) {
      body.loyaltyScore = body.loyaltyLevel;
    }
    if (body.mobilizationAbility !== undefined && body.mobilizationCap === undefined) {
      body.mobilizationCap = body.mobilizationAbility;
    }
    
    const parsed = createElectionKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const birthDate = d.dateOfBirth
      ? new Date(d.dateOfBirth)
      : new Date("1980-01-01");

    // توليد كود تلقائي متسلسل مع retry
    let key = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const maxKey = await prisma.electionKey.aggregate({
        _max: { keyCode: true },
      });
      const maxCodeStr = maxKey._max.keyCode;
      let maxSeq = 0;
      if (maxCodeStr) {
        const num = parseInt(maxCodeStr, 10);
        if (!isNaN(num)) maxSeq = num;
      }
      const generatedCode = String(maxSeq + 1);

      // Calculate electoral values automatically
      const calcData = {
        supportedVotes: d.supportedVotes ?? 0,
        neutralVotes: d.neutralVotes ?? 0,
        weakVotes: d.weakVotes ?? 0,
        totalVotes: d.totalVotes || ((d.supportedVotes ?? 0) + (d.neutralVotes ?? 0) + (d.weakVotes ?? 0)),
        loyaltyScore: d.loyaltyScore ?? 3,
        influenceLevel: d.influenceLevel ?? 3,
        mobilizationCap: d.mobilizationCap ?? 3,
        voteProtection: d.voteProtection ?? 3,
        supportReason: d.supportReason ?? 3,
        needsLevel: d.needsLevel ?? 3,
        politicalNote: d.politicalNote ?? 3,
        organizationalNote: d.organizationalNote ?? 3,
        generalNote: d.generalNote ?? 3,
      };
      const calcResult = calculateAll(calcData);

      try {
        key = await prisma.electionKey.create({
          data: {
            keyCode: generatedCode,
            firstName: d.firstName,
            fatherName: d.fatherName,
            grandfatherName: d.grandfatherName,
            fourthName: d.fourthName,
            gender: d.gender,
            birthDate,
            education: d.education,
            profession: d.profession,
            phone: d.phone,
            province: "ذي قار",
            district: d.district,
            subDistrict: d.subDistrict,
            pollingCenter: d.pollingCenter,
            expectedVotes: d.expectedVotes,
            influenceLevel: d.influenceLevel,
            mobilizationCap: d.mobilizationCap,
            loyaltyScore: d.loyaltyScore,
            riskLevel: d.riskLevel,
            tribeId: d.tribeId || null,
            socialMedia: d.socialMedia || null,

            // === حقول إضافية ===
            nickname: d.nickname || null,
            phone2: d.phone2 || null,
            email: d.email || null,
            address: d.address || null,
            neighborhood: d.neighborhood || null,
            pollingStation: d.pollingStation || null,
            age: d.age || null,
            specialization: d.specialization || null,
            maritalStatus: d.maritalStatus || null,
            familySize: d.familySize || null,
            notes: d.notes || null,
            isActive: d.isActive ?? true,
            firstContactDate: d.firstContactDate ? new Date(d.firstContactDate) : null,
            lastContactDate: d.lastContactDate ? new Date(d.lastContactDate) : null,
            lastSpentDate: d.lastSpentDate ? new Date(d.lastSpentDate) : null,
            trainingStatus: d.trainingStatus || null,
            dataAccuracy: d.dataAccuracy || null,
            createdBy: d.createdBy || null,

            totalVotes: calcData.totalVotes,
            supportedVotes: calcData.supportedVotes,
            neutralVotes: calcData.neutralVotes,
            weakVotes: calcData.weakVotes,
            netVotes: Math.round(calcResult.netVotes),

            voteProtection: d.voteProtection ?? 3,
            supportReason: d.supportReason ?? 3,
            needsLevel: d.needsLevel ?? 3,
            politicalNote: d.politicalNote ?? 3,
            organizationalNote: d.organizationalNote ?? 3,
            generalNote: d.generalNote ?? 3,

            weightedScore: calcResult.weightedScore,
            classification: calcResult.classification,

            eiiScore: d.eiiScore ?? 0.0,
            kriScore: d.kriScore ?? 0.0,
            vpsScore: d.vpsScore ?? 0.0,
            drsScore: d.drsScore ?? 0.0,
            campaignROI: d.campaignROI ?? 0.0,

            totalSpent: d.totalSpent ?? 0.0,
            monthlyBudget: d.monthlyBudget ?? 0.0,
            totalInvestment: d.totalInvestment ?? 0.0,
            costPerVote: d.costPerVote ?? 0.0,
          },
        });
        break;
      } catch {
        attempts++;
      }
    }

    if (!key) {
      return NextResponse.json(
        { error: "فشل توليد كود فريد للمفتاح" },
        { status: 500 }
      );
    }

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "ElectionKey",
      entityId: key.id,
      details: { keyCode: key.keyCode, name: key.firstName },
    });

    return NextResponse.json(mapElectionKeyToUI(key), { status: 201 });
  } catch (error) {
    return handleApiError(error, "electoral-keys-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });
