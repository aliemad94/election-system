// ====================================================================
// /api/voters — الناخبون (GET مع pagination + فلترة + POST)
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { createVoterSchema, formatZodError } from "@/lib/validators";
import { applyKeyUserScope, getKeyUserScope } from "@/lib/scope-service";

function mapVoterToUI(v: any, userRole?: string) {
  if (!v) return null;
  
  const isObserver = userRole === "OBSERVER";
  const isAuthorized = userRole === "ADMIN" || userRole === "KEY_USER";
  const isAdmin = userRole === "ADMIN";

  const electionKeyVal = v.electionKey ? {
    id: v.electionKey.id || v.keyId || "",
    code: v.electionKey.keyCode || v.electionKey.code || "",
    keyCode: v.electionKey.keyCode || v.electionKey.code || "",
    firstName: v.electionKey.firstName || "",
    fatherName: isObserver ? "***" : (v.electionKey.fatherName || null),
  } : null;

  let fullName = [v.firstName, v.fatherName, v.grandfatherName, v.fourthName]
    .filter(Boolean)
    .join(" ")
    .trim();

  let firstName = v.firstName;
  let fatherName = v.fatherName;
  let grandfatherName = v.grandfatherName;
  let fourthName = v.fourthName;
  let phoneVal = v.phone || "";
  let nationalIdVal = v.nationalId || null;

  if (isObserver) {
    fullName = `${v.firstName} ***`;
    fatherName = "***";
    grandfatherName = "***";
    fourthName = "***";
    if (phoneVal) {
      phoneVal = phoneVal.substring(0, 3) + "****" + phoneVal.substring(phoneVal.length - 3);
    }
    nationalIdVal = "***";
  } else {
    phoneVal = isAuthorized ? (v.phone || "") : "";
    nationalIdVal = isAdmin ? (v.nationalId || null) : undefined;
  }

  return {
    id: v.id,
    fullName,
    firstName,
    fatherName: fatherName || null,
    grandfatherName: grandfatherName || null,
    fourthName: fourthName || null,
    gender: v.gender,
    phone: phoneVal,
    phoneNumber: phoneVal, // UI name mapping
    nationalId: nationalIdVal,
    district: v.district,
    subDistrict: v.subDistrict,
    area: v.area || v.subDistrict || "",
    pollingCenter: v.pollingCenter,
    ballotStation: v.ballotStation,
    status: v.status || "NEUTRAL",
    supportDegree: v.supportDegree || 3,
    confidenceScore: v.supportDegree || 3, // UI name mapping
    supportReason: isObserver ? null : (v.supportReason || null),
    
    votedOnDay: v.votedOnDay || false,
    votedStatus: v.votedOnDay || false, // UI name mapping
    checkedIn: v.checkedIn || false,
    checkedInAt: v.checkedInAt ? (v.checkedInAt instanceof Date ? v.checkedInAt : new Date(v.checkedInAt)).toISOString() : null,
    
    keyId: v.keyId,
    electoralKeyId: v.keyId, // UI name mapping
    keyCode: v.electionKey?.keyCode || v.electionKey?.code || "",
    electoralKey: electionKeyVal, // UI name mapping
    electionKey: electionKeyVal,
    
    tribeId: v.tribeId,
    tribeName: v.tribe?.name || "غير محدد",
    tribe: v.tribe ? {
      id: v.tribe.id,
      name: v.tribe.name,
      influence: v.tribe.influenceRating || 3,
    } : null,
    
    relationship: v.relationship || null,
    influenceRate: v.influenceRate || 0,
    lastContactDate: v.lastContactDate ? (v.lastContactDate instanceof Date ? v.lastContactDate : new Date(v.lastContactDate)).toISOString() : null,
    createdAt: v.createdAt ? (v.createdAt instanceof Date ? v.createdAt : new Date(v.createdAt)).toISOString() : null,
    socialMedia: isObserver ? null : (v.socialMedia || null),
    specialization: isObserver ? null : (v.specialization || null),
    profession: isObserver ? null : (v.profession || null),
    education: isObserver ? null : (v.education || null),
    educationLevel: isObserver ? null : (v.education || null), // UI name mapping
    
    gpsVerified: v.gpsVerified || false,
    latitude: isObserver ? null : (v.latitude || null),
    longitude: isObserver ? null : (v.longitude || null),
    isRegistryVerified: v.isRegistryVerified || false,
    registryVoterId: isObserver ? null : (v.registryVoterId || null),
    voterCategory: v.status || "NEUTRAL",
    notes: isObserver ? null : (v.notes || null),
  };
}

// GET /api/voters — pagination + search + filters
async function getHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      200,
      Math.max(1, parseInt(searchParams.get("limit") ?? "50"))
    );
    const tribeId = searchParams.get("tribeId");
    const district = searchParams.get("district");
    const votedStatus = searchParams.get("votedStatus");
    const status = searchParams.get("status");
    const keyId = searchParams.get("keyId");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (tribeId) where.tribeId = tribeId;
    if (district && district !== "all") where.district = district;
    if (keyId) where.keyId = keyId;
    if (status) where.status = status;
    if (votedStatus === "voted") where.votedOnDay = true;
    else if (votedStatus === "not_voted") where.votedOnDay = false;

    // KEY_USER يرى ناخبي مفتاحه فقط (منطق مركزي)
    await applyKeyUserScope(where, user);

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { fatherName: { contains: q, mode: "insensitive" } },
        { grandfatherName: { contains: q, mode: "insensitive" } },
        { fourthName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { nationalId: { contains: q, mode: "insensitive" } },
      ];
    }

    const [voters, total] = await Promise.all([
      prisma.voter.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tribe: { select: { name: true } },
          electionKey: { select: { keyCode: true, firstName: true } },
        },
      }),
      prisma.voter.count({ where }),
    ]);

    const mapped = voters.map((v) => mapVoterToUI(v, user.role));

    return NextResponse.json({ voters: mapped, total, page, limit });
  } catch (error) {
    return handleApiError(error, "voters-get");
  }
}

// POST /api/voters — إنشاء ناخب
async function postHandler(req: NextRequest, { user }: { user: AuthenticatedUser }) {
  try {
    const body = await req.json();

    if (user.role === "KEY_USER") {
      const scope = await getKeyUserScope(user.userId);
      if (!scope) {
        return NextResponse.json(
          { error: "غير مصرح - لا يملك صلاحية إنشاء ناخب لعدم وجود مفتاح مرتبط بحسابه" },
          { status: 403 }
        );
      }
      body.keyId = scope.keyId;
      body.electoralKeyId = scope.keyId;
    }
    
    // Map UI names to DB names before Zod validation
    if (body.phoneNumber !== undefined && body.phone === undefined) {
      body.phone = body.phoneNumber;
    }
    if (body.educationLevel !== undefined && body.education === undefined) {
      body.education = body.educationLevel;
    }
    if (body.confidenceScore !== undefined && body.supportDegree === undefined) {
      body.supportDegree = Number(body.confidenceScore);
    }
    if (body.votedStatus !== undefined && body.votedOnDay === undefined) {
      body.votedOnDay = Boolean(body.votedStatus);
    }
    if (body.electoralKeyId !== undefined && body.keyId === undefined) {
      body.keyId = body.electoralKeyId;
    }

    const parsed = createVoterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const birthDate = d.dateOfBirth ? new Date(d.dateOfBirth) : new Date("1990-01-01");

    // التحقق من تكرار الهاتف
    if (d.phone) {
      const phoneExists = await prisma.voter.findFirst({
        where: { phone: d.phone },
        select: { id: true, firstName: true, fatherName: true, electionKey: { select: { firstName: true } } },
      });
      if (phoneExists) {
        return NextResponse.json(
          { error: "رقم الهاتف مسجل مسبقاً في النظام" },
          { status: 400 }
        );
      }
    }

    // التحقق من تكرار الهوية الوطنية
    if (d.nationalId) {
      const nationalIdExists = await prisma.voter.findFirst({
        where: { nationalId: d.nationalId },
        select: { id: true, firstName: true, fatherName: true, electionKey: { select: { firstName: true } } },
      });
      if (nationalIdExists) {
        return NextResponse.json(
          { error: "رقم الهوية الوطنية مسجل مسبقاً في النظام" },
          { status: 400 }
        );
      }
    }

    // التحقق من وجود المفتاح (اختياري الآن)
    if (d.keyId) {
      const keyExists = await prisma.electionKey.findUnique({
        where: { id: d.keyId },
        select: { id: true },
      });
      if (!keyExists) {
        return NextResponse.json(
          { error: "المفتاح الانتخابي المحدد غير موجود" },
          { status: 400 }
        );
      }
    }

    const voter = await prisma.voter.create({
      data: {
        firstName: d.firstName,
        fatherName: d.fatherName,
        grandfatherName: d.grandfatherName,
        fourthName: d.fourthName,
        gender: d.gender,
        birthDate,
        phone: d.phone ?? undefined,
        nationalId: d.nationalId || null,
        district: d.district,
        subDistrict: d.subDistrict,
        area: d.area || null,
        pollingCenter: d.pollingCenter,
        ballotStation: d.ballotStation,
        keyId: d.keyId ?? '',
        tribeId: d.tribeId || null,
        subTribeId: d.subTribeId || null,
        status: d.status,
        supportDegree: d.supportDegree,
        supportReason: d.supportReason || null,
        profession: d.profession || null,
        education: d.education || null,
        specialization: d.specialization || null,
        maritalStatus: d.maritalStatus || null,
        familySize: d.familySize || null,
        relationship: d.relationship || null,
        influenceRate: d.influenceRate,
        latitude: d.latitude || null,
        gpsVerified: d.gpsVerified,
        socialMedia: d.socialMedia || null,
        checkedIn: d.checkedIn,
        checkedInAt: d.checkedInAt ? new Date(d.checkedInAt) : null,
      },
      include: { tribe: { select: { name: true } } },
    });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "CREATE",
      entity: "Voter",
      entityId: voter.id,
      details: { name: voter.firstName, keyId: voter.keyId },
    });

    return NextResponse.json(mapVoterToUI(voter, user.role), { status: 201 });
  } catch (error) {
    return handleApiError(error, "voters-post");
  }
}

export const GET = withAuth(getHandler, {
  GET: ["ADMIN", "KEY_USER", "OBSERVER"],
});
export const POST = withAuth(postHandler, { POST: ["ADMIN", "KEY_USER"] });

