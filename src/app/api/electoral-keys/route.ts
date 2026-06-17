import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

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
      // Calculate weighted score & classification
      const rawScore =
        ((key.loyaltyScore || 3) - 1) * 20 +
        ((key.influenceLevel || 3) - 1) * 20 +
        ((key.mobilizationCap || 3) - 1) * 15 +
        ((key.riskLevel || 3) - 1) * 15 + // Mapping riskLevel or similar fields
        2 * 10 + // default weight placeholder
        2 * 5 + 
        2 * 5 + 
        2 * 5 + 
        2 * 5;

      const score = Math.min(100, Math.round(rawScore / 3.4));
      let classf = "مقبول";
      if (score < 20) classf = "ضعيف";
      else if (score <= 50) classf = "مقبول";
      else if (score <= 100) classf = "جيد";
      else classf = "قوي";

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
        loyaltyLevel: key.loyaltyScore,
        influenceLevel: key.influenceLevel,
        mobilizationAbility: key.mobilizationCap,
        voteProtection: 3,
        supportReason: 3,
        needsLevel: 3,
        politicalNote: 3,
        organizationalNote: 3,
        generalNote: 3,
        weightedScore: score,
        classification: classf,
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
      tribeId,
      socialMedia,
    } = body;

    const keys = await prisma.electionKey.findMany({
      select: { keyCode: true }
    });
    let maxSeq = 0;
    for (const k of keys) {
      const num = parseInt(k.keyCode, 10);
      if (!isNaN(num)) {
        if (num > maxSeq) {
          maxSeq = num;
        }
      }
    }
    const generatedCode = String(maxSeq + 1);

    if (!firstName || !phone) {
      return NextResponse.json({ error: "الاسم الأول ورقم الهاتف حقول مطلوبة" }, { status: 400 });
    }

    const birthDate = dateOfBirth ? new Date(dateOfBirth) : new Date("1980-01-01");

    const key = await prisma.electionKey.create({
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
        loyaltyScore: parseInt(loyaltyLevel) || 3,
        influenceLevel: parseInt(influenceLevel) || 3,
        mobilizationCap: parseInt(mobilizationAbility) || 3,
        tribeId: tribeId || null,
        socialMedia: socialMedia ? (typeof socialMedia === "string" ? JSON.parse(socialMedia) : socialMedia) : null,
      },
      include: {
        tribe: true,
      }
    });

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
      loyaltyLevel: key.loyaltyScore,
      influenceLevel: key.influenceLevel,
      mobilizationAbility: key.mobilizationCap,
      voteProtection: 3,
      supportReason: 3,
      needsLevel: 3,
      politicalNote: 3,
      organizationalNote: 3,
      generalNote: 3,
      weightedScore: 60,
      classification: "جيد",
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
