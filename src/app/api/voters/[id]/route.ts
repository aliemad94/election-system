// ====================================================================
// /api/voters/[id] — تحديث وحذف ناخب
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";
import { updateVoterSchema, formatZodError } from "@/lib/validators";
function mapVoterToUI(v: any, userRole?: string) {
  if (!v) return null;
  
  const electionKeyVal = v.electionKey ? {
    id: v.electionKey.id || v.keyId || "",
    code: v.electionKey.keyCode || v.electionKey.code || "",
    keyCode: v.electionKey.keyCode || v.electionKey.code || "",
    firstName: v.electionKey.firstName || "",
    fatherName: v.electionKey.fatherName || null,
  } : null;

  const isAuthorized = userRole === "ADMIN" || userRole === "KEY_USER";
  const isAdmin = userRole === "ADMIN";

  const phoneVal = isAuthorized ? (v.phone || "") : "";
  const nationalIdVal = isAdmin ? (v.nationalId || null) : undefined;

  return {
    id: v.id,
    fullName: [v.firstName, v.fatherName, v.grandfatherName, v.fourthName]
      .filter(Boolean)
      .join(" ")
      .trim(),
    firstName: v.firstName,
    fatherName: v.fatherName,
    grandfatherName: v.grandfatherName,
    fourthName: v.fourthName,
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
    supportReason: v.supportReason || null,
    
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
    socialMedia: v.socialMedia || null,
    specialization: v.specialization || null,
    profession: v.profession || null,
    education: v.education || null,
    educationLevel: v.education || null, // UI name mapping
    
    gpsVerified: v.gpsVerified || false,
    latitude: v.latitude || null,
    longitude: v.longitude || null,
    isRegistryVerified: v.isRegistryVerified || false,
    registryVoterId: v.registryVoterId || null,
    voterCategory: v.status || "NEUTRAL",
    notes: v.notes || null,
  };
}

async function putHandler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
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
    
    const parsed = updateVoterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const existing = await prisma.voter.findUnique({
      where: { id },
      select: { id: true, keyId: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "الناخب غير موجود" },
        { status: 404 }
      );
    }

    if (user.role === "KEY_USER") {
      const key = await prisma.electionKey.findFirst({
        where: { phone: user.username },
        select: { id: true },
      });
      if (!key || existing.keyId !== key.id) {
        return NextResponse.json(
          { error: "غير مصرح - لا تملك صلاحية تعديل هذا الناخب" },
          { status: 403 }
        );
      }
    }

    // التحقق من تكرار الهاتف باستثناء السجل الحالي
    if (parsed.data.phone) {
      const phoneExists = await prisma.voter.findFirst({
        where: { phone: parsed.data.phone, id: { not: id } },
        select: { id: true, firstName: true, fatherName: true, electionKey: { select: { firstName: true } } },
      });
      if (phoneExists) {
        return NextResponse.json(
          { error: "رقم الهاتف مسجل مسبقاً في النظام" },
          { status: 400 }
        );
      }
    }

    // التحقق من تكرار الهوية الوطنية باستثناء السجل الحالي
    if (parsed.data.nationalId) {
      const nationalIdExists = await prisma.voter.findFirst({
        where: { nationalId: parsed.data.nationalId, id: { not: id } },
        select: { id: true, firstName: true, fatherName: true, electionKey: { select: { firstName: true } } },
      });
      if (nationalIdExists) {
        return NextResponse.json(
          { error: "رقم الهوية الوطنية مسجل مسبقاً في النظام" },
          { status: 400 }
        );
      }
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.dateOfBirth) {
      data.birthDate = new Date(parsed.data.dateOfBirth);
    }
    delete data.dateOfBirth;

    if (parsed.data.checkedInAt === undefined) {
      delete data.checkedInAt;
    } else if (parsed.data.checkedInAt === null || parsed.data.checkedInAt === "") {
      data.checkedInAt = null;
    } else {
      data.checkedInAt = new Date(parsed.data.checkedInAt);
    }

    if (data.tribeId === "" || data.tribeId === null) {
      data.tribeId = null;
    }
    if (data.subTribeId === "" || data.subTribeId === null) {
      data.subTribeId = null;
    }
    if (data.keyId === "" || data.keyId === null) {
      delete data.keyId;
    }

    const expectedVersion = body.version !== undefined ? Number(body.version) : undefined;
    let updated;
    if (expectedVersion !== undefined) {
      const result = await prisma.voter.updateMany({
        where: { id, version: expectedVersion },
        data: { ...data, version: { increment: 1 } } as any
      });
      if (result.count === 0) {
        return NextResponse.json(
          { error: "السجل تغيّر بواسطة مستخدم آخر، أعد التحميل" },
          { status: 409 }
        );
      }
      const fetched = await prisma.voter.findUnique({ where: { id } });
      if (!fetched) {
        return NextResponse.json(
          { error: "الناخب غير موجود" },
          { status: 404 }
        );
      }
      updated = fetched;
    } else {
      updated = await prisma.voter.update({
        where: { id },
        data,
      });
    }

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "Voter",
      entityId: id,
      details: { name: updated.firstName, keyId: updated.keyId },
    });

    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json(mapVoterToUI(updated, user.role));
  } catch (error) {
    return handleApiError(error, "voters-put");
  }
}

async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const existing = await prisma.voter.findUnique({
      where: { id },
      select: { id: true, firstName: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "الناخب غير موجود" },
        { status: 404 }
      );
    }

    await prisma.voter.delete({ where: { id } });

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "Voter",
      entityId: id,
      details: { name: existing.firstName },
    });

    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "voters-delete");
  }
}

export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["ADMIN"] });

