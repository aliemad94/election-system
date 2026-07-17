// ====================================================================
// /api/electoral-keys/[id] — تحديث وحذف مفتاح انتخابي
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatedUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-guard";
import { handleApiError, auditLog } from "@/lib/security";
import { invalidateComprehensiveIndicatorsCache } from "@/lib/comprehensive-indicators-cache";
import { updateElectionKeySchema, formatZodError } from "@/lib/validators";
import { calculateAll } from "@/lib/electoral-calculations";

function mapElectionKeyToUI(k: any) {
  if (!k) return null;
  const votersCount = k.voters ? k.voters.length : (k._count?.voters ?? 0);
  return {
    id: k.id,
    code: k.keyCode,
    keyCode: k.keyCode,
    fullName: [k.firstName, k.fatherName, k.grandfatherName, k.fourthName]
      .filter(Boolean)
      .join(" ")
      .trim(),
    firstName: k.firstName,
    fatherName: k.fatherName,
    grandfatherName: k.grandfatherName,
    fourthName: k.fourthName,
    gender: k.gender,
    phone: k.phone,
    district: k.district,
    subDistrict: k.subDistrict,
    area: k.subDistrict, // UI name mapping
    pollingCenter: k.pollingCenter,
    dateOfBirth: k.birthDate ? (k.birthDate instanceof Date ? k.birthDate : new Date(k.birthDate)).toISOString().split("T")[0] : null,
    education: k.education || "",
    educationLevel: k.education || "",
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
    profession: k.profession || null,
    socialMedia: k.socialMedia || null,
    nickname: k.nickname || null,
    phone2: k.phone2 || null,
    email: k.email || null,
    address: k.address || null,
    neighborhood: k.neighborhood || null,
    pollingStation: k.pollingStation || null,
    age: k.age || null,
    specialization: k.specialization || null,
    maritalStatus: k.maritalStatus || null,
    familySize: k.familySize || null,
    notes: k.notes || null,
    isActive: k.isActive !== undefined ? k.isActive : true,
    firstContactDate: k.firstContactDate ? (k.firstContactDate instanceof Date ? k.firstContactDate : new Date(k.firstContactDate)).toISOString() : null,
    lastContactDate: k.lastContactDate ? (k.lastContactDate instanceof Date ? k.lastContactDate : new Date(k.lastContactDate)).toISOString() : null,
    lastSpentDate: k.lastSpentDate ? (k.lastSpentDate instanceof Date ? k.lastSpentDate : new Date(k.lastSpentDate)).toISOString() : null,
    trainingStatus: k.trainingStatus || null,
    dataAccuracy: k.dataAccuracy || null,
    createdBy: k.createdBy || null,
    lastEvaluationAt: k.lastEvaluationAt ? (k.lastEvaluationAt instanceof Date ? k.lastEvaluationAt : new Date(k.lastEvaluationAt)).toISOString() : null,

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
    totalSpent: k.totalSpent || 0,
    monthlyBudget: k.monthlyBudget || 0,
    totalInvestment: k.totalInvestment || 0,
    costPerVote: k.costPerVote || 0,
  };
}

// PUT /api/electoral-keys/[id]
async function putHandler(
  req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
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

    // ============================================================
    // CRITICAL GUARD: Capture which keys were EXPLICITLY provided
    // in the request BEFORE Zod parses and applies .default() values.
    // Without this, a partial update (e.g. { firstName: 'X' }) would
    // cause Zod to fill in default(0) for votes, default('') for
    // text fields, etc., and then { ...d } would silently wipe every
    // field in the DB that was not sent by the client.
    // ============================================================
    const explicitKeys = new Set(Object.keys(body));

    const parsed = updateElectionKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodError(parsed.error) },
        { status: 400 }
      );
    }

    const existing = await prisma.electionKey.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المفتاح الانتخابي غير موجود" },
        { status: 404 }
      );
    }

    // KEY_USER يمكنه تعديل مفتاحه فقط
    if (user.role === "KEY_USER" && existing.phone !== user.username) {
      return NextResponse.json(
        { error: "غير مصرح - يمكنك تعديل مفتاحك فقط" },
        { status: 403 }
      );
    }

    const d = parsed.data;

    // Helper: check if a field was actually sent by the client
    // (not just a Zod default). We check both the original name and
    // common UI aliases that were remapped above.
    const wasProvided = (dbKey: string, ...uiAliases: string[]): boolean =>
      explicitKeys.has(dbKey) || uiAliases.some(a => explicitKeys.has(a));

    // Merge: prefer the explicitly-sent value; fall back to the current DB value.
    const merged = {
      supportedVotes: wasProvided('supportedVotes') ? (d.supportedVotes ?? existing.supportedVotes) : existing.supportedVotes,
      neutralVotes:   wasProvided('neutralVotes')   ? (d.neutralVotes   ?? existing.neutralVotes)   : existing.neutralVotes,
      weakVotes:      wasProvided('weakVotes')       ? (d.weakVotes      ?? existing.weakVotes)       : existing.weakVotes,
      totalVotes:     wasProvided('totalVotes')      ? (d.totalVotes     ?? existing.totalVotes)      : existing.totalVotes,
      loyaltyScore:   wasProvided('loyaltyScore', 'loyaltyLevel')         ? (d.loyaltyScore    ?? existing.loyaltyScore)    : existing.loyaltyScore,
      influenceLevel: wasProvided('influenceLevel')                        ? (d.influenceLevel  ?? existing.influenceLevel)  : existing.influenceLevel,
      mobilizationCap: wasProvided('mobilizationCap', 'mobilizationAbility') ? (d.mobilizationCap ?? existing.mobilizationCap) : existing.mobilizationCap,
      voteProtection:   wasProvided('voteProtection')    ? (d.voteProtection   ?? existing.voteProtection)   : existing.voteProtection,
      supportReason:    wasProvided('supportReason')     ? (d.supportReason    ?? existing.supportReason)    : existing.supportReason,
      needsLevel:       wasProvided('needsLevel')        ? (d.needsLevel       ?? existing.needsLevel)       : existing.needsLevel,
      politicalNote:    wasProvided('politicalNote')     ? (d.politicalNote    ?? existing.politicalNote)    : existing.politicalNote,
      organizationalNote: wasProvided('organizationalNote') ? (d.organizationalNote ?? existing.organizationalNote) : existing.organizationalNote,
      generalNote:      wasProvided('generalNote')       ? (d.generalNote      ?? existing.generalNote)      : existing.generalNote,
    };

    // Auto-sum totalVotes when individual vote buckets are sent but totalVotes is not
    if (!wasProvided('totalVotes') && (wasProvided('supportedVotes') || wasProvided('neutralVotes') || wasProvided('weakVotes'))) {
      merged.totalVotes = merged.supportedVotes + merged.neutralVotes + merged.weakVotes;
    }

    const calcResult = calculateAll(merged);

    // Build update payload: only include fields the client explicitly sent.
    // This is the key safeguard — Zod default values are never written to the DB
    // unless the client actually sent that field.
    const data: Record<string, unknown> = {};
    for (const key of Object.keys(d as object)) {
      if (explicitKeys.has(key)) {
        data[key] = (d as Record<string, unknown>)[key];
      }
    }

    // Always recalculate derived vote/scoring fields (these are always safe to update)
    data.totalVotes    = merged.totalVotes;
    data.netVotes      = Math.round(calcResult.netVotes);
    data.weightedScore = calcResult.weightedScore;
    data.classification = calcResult.classification;

    // Handle dateOfBirth → birthDate rename
    if (wasProvided('dateOfBirth') && d.dateOfBirth) {
      data.birthDate = new Date(d.dateOfBirth);
    }
    delete data.dateOfBirth;

    // Handle optional date fields — only touch if explicitly provided
    const dateFields = ["firstContactDate", "lastContactDate", "lastSpentDate"];
    for (const field of dateFields) {
      if (!explicitKeys.has(field)) {
        delete data[field]; // not sent — keep existing DB value
      } else {
        const val = (d as Record<string, unknown>)[field];
        data[field] = (val === null || val === "" || val === undefined) ? null : new Date(val as string);
      }
    }

    // Normalise empty-string foreign keys to null
    if (data.tribeId === "" || data.tribeId === null) {
      data.tribeId = null;
    }
    if (data.subTribeId === "" || data.subTribeId === null) {
      data.subTribeId = null;
    }

    const expectedVersion = body.version !== undefined ? Number(body.version) : undefined;
    let updated;
    if (expectedVersion !== undefined) {
      const result = await prisma.electionKey.updateMany({
        where: { id, version: expectedVersion },
        data: { ...data, version: { increment: 1 } } as any
      });
      if (result.count === 0) {
        return NextResponse.json(
          { error: "السجل تغيّر بواسطة مستخدم آخر، أعد التحميل" },
          { status: 409 }
        );
      }
      const fetched = await prisma.electionKey.findUnique({ where: { id } });
      if (!fetched) {
        return NextResponse.json(
          { error: "المفتاح الانتخابي غير موجود" },
          { status: 404 }
        );
      }
      updated = fetched;
    } else {
      updated = await prisma.electionKey.update({
        where: { id },
        data,
      });
    }

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "UPDATE",
      entity: "ElectionKey",
      entityId: id,
      details: { fields: [...explicitKeys].join(', ') },
    });

    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json(mapElectionKeyToUI(updated));
  } catch (error) {
    return handleApiError(error, "electoral-keys-put");
  }
}

// DELETE /api/electoral-keys/[id]
async function deleteHandler(
  _req: NextRequest,
  { params, user }: { params: Promise<{ id: string }>; user: AuthenticatedUser }
) {
  try {
    const { id } = await params;
    const existing = await prisma.electionKey.findUnique({
      where: { id },
      select: { id: true, firstName: true, keyCode: true, phone: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "المفتاح الانتخابي غير موجود" },
        { status: 404 }
      );
    }

    // حذف السجلات المرتبطة لتفادي انتهاك القيود الخارجية (Foreign Key Constraints)
    await prisma.$transaction([
      prisma.task.deleteMany({ where: { electoralKeyId: id } }),
      prisma.service.deleteMany({ where: { keyId: id } }),
      prisma.voter.deleteMany({ where: { keyId: id } }),
      prisma.electionKey.delete({ where: { id } }),
    ]);

    await auditLog({
      userId: user.userId,
      username: user.username,
      action: "DELETE",
      entity: "ElectionKey",
      entityId: id,
      details: { keyCode: existing.keyCode, name: existing.firstName },
    });

    invalidateComprehensiveIndicatorsCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "electoral-keys-delete");
  }
}

export const PUT = withAuth(putHandler, { PUT: ["ADMIN", "KEY_USER"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["ADMIN"] });

