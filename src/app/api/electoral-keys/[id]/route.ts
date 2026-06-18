import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, AuthenticatedUser } from "@/lib/auth-guard";
import { isValidCuid } from "@/lib/security";

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
    if (body.loyaltyLevel !== undefined) updateData.loyaltyScore = parseInt(body.loyaltyLevel) || 3;
    if (body.influenceLevel !== undefined) updateData.influenceLevel = parseInt(body.influenceLevel) || 3;
    if (body.mobilizationAbility !== undefined) updateData.mobilizationCap = parseInt(body.mobilizationAbility) || 3;

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

    const rawScore =
      ((updated.loyaltyScore || 3) - 1) * 20 +
      ((updated.influenceLevel || 3) - 1) * 20 +
      ((updated.mobilizationCap || 3) - 1) * 15 +
      30; // offset placeholder

    const score = Math.min(100, Math.round(rawScore / 2.5));
    let classf = "مقبول";
    if (score < 20) classf = "ضعيف";
    else if (score <= 50) classf = "مقبول";
    else if (score <= 100) classf = "جيد";
    else classf = "قوي";

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
      loyaltyLevel: updated.loyaltyScore,
      influenceLevel: updated.influenceLevel,
      mobilizationAbility: updated.mobilizationCap,
      voteProtection: 3,
      supportReason: 3,
      needsLevel: 3,
      politicalNote: 3,
      organizationalNote: 3,
      generalNote: 3,
      weightedScore: score,
      classification: classf,
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
