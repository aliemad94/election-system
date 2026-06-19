import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { isValidCuid } from "@/lib/security";
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

// PUT /api/electoral-keys/[id] - Updates electoral key fields
async function putHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const keyId = params.id;
    if (!isValidCuid(keyId)) {
      return NextResponse.json({ error: "معرف المفتاح الانتخابي غير صالح" }, { status: 400 });
    }
    const body = await request.json();

    const updateData: Record<string, any> = {};

    if (body.code !== undefined) updateData.keyCode = body.code;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.fatherName !== undefined) updateData.fatherName = body.fatherName;
    if (body.grandfatherName !== undefined) updateData.grandfatherName = body.grandfatherName;
    if (body.fourthName !== undefined) updateData.fourthName = body.fourthName;
    if (body.gender !== undefined) updateData.gender = body.gender;

    if (body.dateOfBirth !== undefined) {
      updateData.birthDate = body.dateOfBirth ? new Date(body.dateOfBirth) : new Date("1980-01-01");
    }

    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.educationLevel !== undefined) updateData.education = body.educationLevel;
    if (body.profession !== undefined) updateData.profession = body.profession;
    if (body.governorate !== undefined) updateData.province = body.governorate;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.area !== undefined) updateData.subDistrict = body.area;
    if (body.pollingCenter !== undefined) updateData.pollingCenter = body.pollingCenter;

    if (body.totalVotes !== undefined) updateData.expectedVotes = parseInt(body.totalVotes) || 0;

    // Retrieve existing key ratings to overlay updates securely
    const existing = await prisma.electionKey.findUnique({
      where: { id: keyId },
      select: { reliabilityLogs: true, loyaltyScore: true, influenceLevel: true, mobilizationCap: true, riskLevel: true }
    });

    let currentRatings = {
      loyaltyLevel: existing?.loyaltyScore ?? 3,
      influenceLevel: existing?.influenceLevel ?? 3,
      mobilizationAbility: existing?.mobilizationCap ?? 3,
      riskLevel: existing?.riskLevel ?? 3,
      voteProtection: 3,
      supportReason: 3,
      needsLevel: 3,
      politicalNote: 3,
      organizationalNote: 3,
      generalNote: 3,
    };

    if (existing?.reliabilityLogs && typeof existing.reliabilityLogs === "object") {
      currentRatings = { ...currentRatings, ...(existing.reliabilityLogs as any) };
    }

    if (body.loyaltyLevel !== undefined) currentRatings.loyaltyLevel = parseInt(body.loyaltyLevel) || 3;
    if (body.influenceLevel !== undefined) currentRatings.influenceLevel = parseInt(body.influenceLevel) || 3;
    if (body.mobilizationAbility !== undefined) currentRatings.mobilizationAbility = parseInt(body.mobilizationAbility) || 3;
    if (body.riskLevel !== undefined) currentRatings.riskLevel = parseInt(body.riskLevel) || 3;
    if (body.needsLevel !== undefined) {
      currentRatings.needsLevel = parseInt(body.needsLevel) || 3;
      if (body.riskLevel === undefined) currentRatings.riskLevel = currentRatings.needsLevel; // map needsLevel to riskLevel index
    }
    if (body.voteProtection !== undefined) currentRatings.voteProtection = parseInt(body.voteProtection) || 3;
    if (body.supportReason !== undefined) currentRatings.supportReason = parseInt(body.supportReason) || 3;
    if (body.politicalNote !== undefined) currentRatings.politicalNote = parseInt(body.politicalNote) || 3;
    if (body.organizationalNote !== undefined) currentRatings.organizationalNote = parseInt(body.organizationalNote) || 3;
    if (body.generalNote !== undefined) currentRatings.generalNote = parseInt(body.generalNote) || 3;

    updateData.loyaltyScore = currentRatings.loyaltyLevel;
    updateData.influenceLevel = currentRatings.influenceLevel;
    updateData.mobilizationCap = currentRatings.mobilizationAbility;
    updateData.riskLevel = currentRatings.riskLevel;
    updateData.reliabilityLogs = currentRatings;

    if (body.tribeId !== undefined) updateData.tribeId = body.tribeId || null;

    if (body.socialMedia !== undefined) {
      updateData.socialMedia = safeJsonParse(body.socialMedia);
    }

    const updated = await prisma.electionKey.update({
      where: { id: keyId },
      data: updateData,
      include: {
        tribe: true,
        _count: {
          select: { voters: true }
        }
      }
    });

    const { score, classification, ratings } = calculateKeyScore(updated);

    return NextResponse.json({
      id: updated.id,
      code: updated.keyCode,
      firstName: updated.firstName,
      fatherName: updated.fatherName,
      grandfatherName: updated.grandfatherName,
      fourthName: updated.fourthName,
      nickname: updated.tribe?.name || "",
      gender: updated.gender,
      phone: updated.phone,
      educationLevel: updated.education,
      profession: updated.profession,
      governorate: updated.province,
      district: updated.district,
      area: updated.subDistrict,
      pollingCenter: updated.pollingCenter,
      totalVotes: updated.expectedVotes,
      supportedVotes: Math.round(updated.expectedVotes * 0.6),
      neutralVotes: Math.round(updated.expectedVotes * 0.3),
      weakVotes: Math.round(updated.expectedVotes * 0.1),
      netVotes: updated.expectedVotes,
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
      tribeId: updated.tribeId,
      tribe: updated.tribe,
      voterCount: updated._count?.voters || 0,
      notes: "",
      socialMedia: updated.socialMedia ? JSON.stringify(updated.socialMedia) : null,
      dateOfBirth: updated.birthDate ? updated.birthDate.toISOString().split("T")[0] : null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("[electoral-keys-put] failed:", error);
    return NextResponse.json({ error: "Failed to update electoral key" }, { status: 500 });
  }
}

// DELETE /api/electoral-keys/[id] - Deletes an electoral key
async function deleteHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const keyId = params.id;
    if (!isValidCuid(keyId)) {
      return NextResponse.json({ error: "معرف المفتاح الانتخابي غير صالح" }, { status: 400 });
    }
    await prisma.electionKey.delete({ where: { id: keyId } });
    return NextResponse.json({ success: true, message: "Electoral key deleted successfully" });
  } catch (error) {
    console.error("[electoral-keys-delete] failed:", error);
    return NextResponse.json({ error: "Failed to delete electoral key" }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler, { PUT: ["admin", "operator"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["admin"] });
