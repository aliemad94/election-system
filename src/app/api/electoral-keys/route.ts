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
import { toElectionKeyDTO } from "@/lib/response-dto";

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

    const result = (keys as any[]).map((k) => toElectionKeyDTO(k, user.role));

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

    return NextResponse.json(toElectionKeyDTO(key, user.role), { status: 201 });
  } catch (error) {
    return handleApiError(error, "electoral-keys-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });
