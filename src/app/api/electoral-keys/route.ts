import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { calculateKeyScore } from "@/lib/indicators-helper";

function safeJsonParse(val: any) {
  if (!val) return null;
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return { text: val };
    }
  }
  return val;
}

// GET /api/electoral-keys - Handles querying electoral keys with matching fields
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const classification = searchParams.get("classification");
    const search = searchParams.get("search");

    const where: Record<string, any> = {};

    if (district) {
      where.district = district;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { fatherName: { contains: q, mode: 'insensitive' } },
        { grandfatherName: { contains: q, mode: 'insensitive' } },
        { fourthName: { contains: q, mode: 'insensitive' } },
        { keyCode: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ];
    }

    // If role is KEY_USER, restrict to their own key
    if (user.role === "KEY_USER") {
      where.phone = user.username;
    }

    const keys = await prisma.electionKey.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        tribe: true,
        _count: {
          select: { voters: true }
        }
      }
    });

    const mappedKeys = keys.map((key) => {
      const { score, classification, ratings } = calculateKeyScore(key);

      return {
        id: key.id,
        code: key.keyCode,
        firstName: key.firstName,
        fatherName: key.fatherName,
        grandfatherName: key.grandfatherName,
        fourthName: key.fourthName,
        nickname: key.tribe?.name || "",
        gender: key.gender,
        phone: key.phone,
        educationLevel: key.education,
        profession: key.profession,
        governorate: key.province,
        district: key.district,
        area: key.subDistrict, // SubDistrict maps to area/neighborhood in client context
        pollingCenter: key.pollingCenter,
        totalVotes: key.expectedVotes, // map client expectation
        supportedVotes: Math.round(key.expectedVotes * 0.6), // Mocked breakdown or default distribution if not saved separately
        neutralVotes: Math.round(key.expectedVotes * 0.3),
        weakVotes: Math.round(key.expectedVotes * 0.1),
        netVotes: key.expectedVotes,
        loyaltyLevel: ratings.loyaltyLevel,
        influenceLevel: ratings.influenceLevel,
        mobilizationAbility: ratings.mobilizationAbility,
        voteProtection: ratings.voteProtection,
        supportReason: ratings.supportReason,
        needsLevel: ratings.needsLevel,
        politicalNote: ratings.politicalNote,
        organizationalNote: ratings.organizationalNote,
        generalNote: ratings.generalNote,
        weightedScore: score,
        classification: classification,
        tribeId: key.tribeId,
        tribe: key.tribe,
        voterCount: key._count?.voters || 0,
        notes: "",
        socialMedia: key.socialMedia ? (typeof key.socialMedia === "string" ? key.socialMedia : JSON.stringify(key.socialMedia)) : null,
        dateOfBirth: key.birthDate ? key.birthDate.toISOString().split("T")[0] : null,
        createdAt: key.createdAt.toISOString(),
      };
    });

    // Client classification filter
    const finalKeys = classification 
      ? mappedKeys.filter(k => k.classification === classification)
      : mappedKeys;

    return NextResponse.json(finalKeys);
  } catch (error) {
    console.error("[electoral-keys-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve electoral keys" }, { status: 500 });
  }
}

// POST /api/electoral-keys - Create key with full schema
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    const {
      code,
      firstName,
      fatherName,
      grandfatherName,
      fourthName,
      gender,
      dateOfBirth,
      phone,
      educationLevel,
      profession,
      governorate,
      district,
      area,
      pollingCenter,
      totalVotes,
      loyaltyLevel,
      influenceLevel,
      mobilizationAbility,
      riskLevel,
      voteProtection,
      supportReason,
      needsLevel,
      politicalNote,
      organizationalNote,
      generalNote,
      tribeId,
      socialMedia,
    } = body;

    if (!firstName || !phone) {
      return NextResponse.json({ error: "الاسم الأول ورقم الهاتف حقول مطلوبة" }, { status: 400 });
    }

    const birthDate = dateOfBirth ? new Date(dateOfBirth) : new Date("1980-01-01");

    const relLogs = {
      loyaltyLevel: parseInt(loyaltyLevel) || 3,
      influenceLevel: parseInt(influenceLevel) || 3,
      mobilizationAbility: parseInt(mobilizationAbility) || 3,
      riskLevel: parseInt(riskLevel) || parseInt(needsLevel) || 3,
      voteProtection: parseInt(voteProtection) || 3,
      supportReason: parseInt(supportReason) || 3,
      needsLevel: parseInt(needsLevel) || 3,
      politicalNote: parseInt(politicalNote) || 3,
      organizationalNote: parseInt(organizationalNote) || 3,
      generalNote: parseInt(generalNote) || 3,
    };

    let generatedCode = "";
    let attempts = 0;
    const maxAttempts = 5;
    let key = null;

    while (attempts < maxAttempts) {
      const maxKey = await prisma.electionKey.aggregate({
        _max: {
          keyCode: true
        }
      });
      const maxCodeStr = maxKey._max.keyCode;
      let maxSeq = 0;
      if (maxCodeStr) {
        const num = parseInt(maxCodeStr, 10);
        if (!isNaN(num)) {
          maxSeq = num;
        }
      }
      generatedCode = String(maxSeq + 1);

      try {
        key = await prisma.electionKey.create({
          data: {
            keyCode: generatedCode,
            firstName,
            fatherName: fatherName || "",
            grandfatherName: grandfatherName || "",
            fourthName: fourthName || "",
            gender: gender || "ذكر",
            birthDate,
            phone,
            education: educationLevel || "",
            profession: profession || "",
            province: governorate || "ذي قار",
            district: district || "الناصرية",
            subDistrict: area || "",
            pollingCenter: pollingCenter || "",
            expectedVotes: parseInt(totalVotes) || 0,
            loyaltyScore: relLogs.loyaltyLevel,
            influenceLevel: relLogs.influenceLevel,
            mobilizationCap: relLogs.mobilizationAbility,
            riskLevel: relLogs.riskLevel,
            reliabilityLogs: relLogs,
            tribeId: tribeId || null,
            socialMedia: safeJsonParse(socialMedia),
          },
          include: {
            tribe: true,
          }
        });
        break; // Success!
      } catch (error: any) {
        if (error.code === 'P2002' && (error.meta?.target?.includes('keyCode') || error.message?.includes('keyCode'))) {
          attempts++;
          continue; // Retry with a new generated code
        }
        throw error; // Propagate other errors
      }
    }

    if (!key) {
      return NextResponse.json({ error: "فشل توليد كود المفتاح الانتخابي بسبب التزامن، يرجى المحاولة مرة أخرى" }, { status: 500 });
    }

    const { score, classification, ratings } = calculateKeyScore(key);

    return NextResponse.json({
      id: key.id,
      code: key.keyCode,
      firstName: key.firstName,
      fatherName: key.fatherName,
      grandfatherName: key.grandfatherName,
      fourthName: key.fourthName,
      nickname: key.tribe?.name || "",
      gender: key.gender,
      phone: key.phone,
      educationLevel: key.education,
      profession: key.profession,
      governorate: key.province,
      district: key.district,
      area: key.subDistrict,
      pollingCenter: key.pollingCenter,
      totalVotes: key.expectedVotes,
      supportedVotes: Math.round(key.expectedVotes * 0.6),
      neutralVotes: Math.round(key.expectedVotes * 0.3),
      weakVotes: Math.round(key.expectedVotes * 0.1),
      netVotes: key.expectedVotes,
      loyaltyLevel: ratings.loyaltyLevel,
      influenceLevel: ratings.influenceLevel,
      mobilizationAbility: ratings.mobilizationAbility,
      voteProtection: ratings.voteProtection,
      supportReason: ratings.supportReason,
      needsLevel: ratings.needsLevel,
      politicalNote: ratings.politicalNote,
      organizationalNote: ratings.organizationalNote,
      generalNote: ratings.generalNote,
      weightedScore: score,
      classification: classification,
      tribeId: key.tribeId,
      tribe: key.tribe,
      voterCount: 0,
      notes: "",
      socialMedia: key.socialMedia ? JSON.stringify(key.socialMedia) : null,
      dateOfBirth: key.birthDate ? key.birthDate.toISOString().split("T")[0] : null,
      createdAt: key.createdAt.toISOString(),
    }, { status: 201 });
  } catch (error: any) {
    console.error("[electoral-keys-post] failed:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "كود المفتاح أو رقم الهاتف مسجل مسبقاً" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create electoral key" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator"] });
