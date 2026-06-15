import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";

// GET /api/voters - Handles pagination, search, and filters matching the full Postgres schema
async function getHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "50")));
    const tribeId = searchParams.get("tribeId");
    const district = searchParams.get("district");
    const votedStatus = searchParams.get("votedStatus");
    const search = searchParams.get("search");

    const where: Record<string, any> = {};
    if (tribeId) {
      where.tribeId = tribeId;
    }
    if (district) {
      where.district = district;
    }
    if (votedStatus === "voted") {
      where.votedOnDay = true;
    } else if (votedStatus === "not_voted") {
      where.votedOnDay = false;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { fatherName: { contains: q, mode: 'insensitive' } },
        { grandfatherName: { contains: q, mode: 'insensitive' } },
        { fourthName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { nationalId: { contains: q } },
      ];
    }

    // If role is KEY_USER, they should only see voters assigned to their key
    if (user.role === "KEY_USER") {
      const key = await prisma.electionKey.findFirst({
        where: { phone: user.username }, // username is the identifier / phone
        select: { id: true },
      });
      if (key) {
        where.keyId = key.id;
      }
    }

    const [voters, total] = await Promise.all([
      prisma.voter.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tribe: true,
          electionKey: true,
        },
      }),
      prisma.voter.count({ where }),
    ]);

    const mappedVoters = voters.map((v) => {
      const fullName = [v.firstName, v.fatherName, v.grandfatherName, v.fourthName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return {
        ...v,
        fullName,
        phoneNumber: v.phone || "",
        nickname: v.tribe?.name || "غير محدد",
      };
    });

    return NextResponse.json({ voters: mappedVoters, total, page, limit });
  } catch (error) {
    console.error("[voters-get] failed:", error);
    return NextResponse.json({ error: "Failed to retrieve voters" }, { status: 500 });
  }
}

// POST /api/voters - Handles creation with full Postgres schema fields
async function postHandler(request: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await request.json();
    
    const {
      firstName,
      fatherName,
      grandfatherName,
      fourthName,
      gender,
      dateOfBirth,
      phoneNumber,
      phone,
      nationalId,
      district,
      subDistrict,
      area,
      pollingCenterName,
      pollingCenter,
      pollingCenterId,
      ballotStation,
      keyId,
      electoralKeyId,
      tribeId,
      subTribeId,
      voterCategory,
      status,
      confidenceScore,
      supportDegree,
      supportReason,
      profession,
      educationLevel,
      education,
      maritalStatus,
      familySize,
      firstContactDate,
      lastContactDate,
      contactResult,
      nextAction,
      followUpDate,
      relationship,
      influenceRate,
      isPrimaryFollow,
      latitude,
      longitude,
      gpsVerified,
      isRegistryVerified,
      registryVoterId,
      socialMedia,
    } = body;

    // Check required fields
    if (!firstName || !gender || (!keyId && !electoralKeyId)) {
      return NextResponse.json({ error: "الاسم الأول والجنس والمفتاح الانتخابي حقول مطلوبة" }, { status: 400 });
    }

    const birthDate = dateOfBirth ? new Date(dateOfBirth) : new Date("1980-01-01");
    const activeKeyId = keyId || electoralKeyId;

    const voter = await prisma.voter.create({
      data: {
        firstName,
        fatherName: fatherName || "",
        grandfatherName: grandfatherName || "",
        fourthName: fourthName || "",
        gender: gender || "ذكر",
        birthDate,
        phone: phone || phoneNumber || null,
        nationalId: nationalId || null,
        district: district || "الغراف",
        subDistrict: subDistrict || "",
        area: area || "",
        pollingCenter: pollingCenterName || pollingCenter || "",
        ballotStation: pollingCenterId || ballotStation || "",
        keyId: activeKeyId,
        tribeId: tribeId || null,
        subTribeId: subTribeId || null,
        status: voterCategory || status || "NEUTRAL",
        supportDegree: parseInt(confidenceScore) || parseInt(supportDegree) || 3,
        supportReason: supportReason || null,
        profession: profession || null,
        education: educationLevel || education || null,
        maritalStatus: maritalStatus || null,
        familySize: parseInt(familySize) || null,
        firstContactDate: firstContactDate ? new Date(firstContactDate) : null,
        lastContactDate: lastContactDate ? new Date(lastContactDate) : null,
        contactResult: contactResult || null,
        nextAction: nextAction || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        relationship: relationship || null,
        influenceRate: parseInt(influenceRate) || 50,
        isPrimaryFollow: isPrimaryFollow !== undefined ? Boolean(isPrimaryFollow) : true,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        gpsVerified: gpsVerified !== undefined ? Boolean(gpsVerified) : false,
        isRegistryVerified: isRegistryVerified !== undefined ? Boolean(isRegistryVerified) : false,
        registryVoterId: registryVoterId || null,
        socialMedia: socialMedia ? (typeof socialMedia === "string" ? JSON.parse(socialMedia) : socialMedia) : null,
      },
      include: {
        tribe: true,
      },
    });

    const fullName = [voter.firstName, voter.fatherName, voter.grandfatherName, voter.fourthName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return NextResponse.json({
      ...voter,
      fullName,
      phoneNumber: voter.phone || "",
      nickname: voter.tribe?.name || "غير محدد",
    }, { status: 201 });
  } catch (error) {
    console.error("[voters-post] failed:", error);
    return NextResponse.json({ error: "Failed to create voter" }, { status: 500 });
  }
}

export const GET = withAuth(getHandler, { GET: ["admin", "viewer", "operator", "key_user"] });
export const POST = withAuth(postHandler, { POST: ["admin", "operator", "key_user"] });
