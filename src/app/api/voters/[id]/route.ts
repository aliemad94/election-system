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

// PUT /api/voters/[id] - Updates a voter with the full set of fields
async function putHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const voterId = params.id;
    if (!isValidCuid(voterId)) {
      return NextResponse.json({ error: "معرف الناخب غير صالح" }, { status: 400 });
    }
    const body = await request.json();

    // Map field updates (only update fields if they are sent in body)
    const updateData: Record<string, any> = {};

    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.fatherName !== undefined) updateData.fatherName = body.fatherName;
    if (body.grandfatherName !== undefined) updateData.grandfatherName = body.grandfatherName;
    if (body.fourthName !== undefined) updateData.fourthName = body.fourthName;
    if (body.gender !== undefined) updateData.gender = body.gender;
    
    if (body.dateOfBirth !== undefined) {
      updateData.birthDate = body.dateOfBirth ? new Date(body.dateOfBirth) : new Date("1980-01-01");
    } else if (body.birthDate !== undefined) {
      updateData.birthDate = body.birthDate ? new Date(body.birthDate) : new Date("1980-01-01");
    }

    if (body.phoneNumber !== undefined) updateData.phone = body.phoneNumber;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.nationalId !== undefined) updateData.nationalId = body.nationalId;
    if (body.district !== undefined) updateData.district = body.district;
    if (body.subDistrict !== undefined) updateData.subDistrict = body.subDistrict;
    if (body.area !== undefined) updateData.area = body.area;

    if (body.pollingCenterName !== undefined) updateData.pollingCenter = body.pollingCenterName;
    if (body.pollingCenter !== undefined) updateData.pollingCenter = body.pollingCenter;
    
    if (body.pollingCenterId !== undefined) updateData.ballotStation = body.pollingCenterId;
    if (body.ballotStation !== undefined) updateData.ballotStation = body.ballotStation;

    const activeKeyId = body.keyId || body.electoralKeyId;
    if (activeKeyId !== undefined) updateData.keyId = activeKeyId;

    if (body.tribeId !== undefined) updateData.tribeId = body.tribeId || null;
    if (body.subTribeId !== undefined) updateData.subTribeId = body.subTribeId || null;

    if (body.voterCategory !== undefined) updateData.status = body.voterCategory;
    if (body.status !== undefined) updateData.status = body.status;

    if (body.confidenceScore !== undefined) updateData.supportDegree = parseInt(body.confidenceScore) || 3;
    if (body.supportDegree !== undefined) updateData.supportDegree = parseInt(body.supportDegree) || 3;

    if (body.supportReason !== undefined) updateData.supportReason = body.supportReason;
    if (body.profession !== undefined) updateData.profession = body.profession;
    
    if (body.educationLevel !== undefined) updateData.education = body.educationLevel;
    if (body.education !== undefined) updateData.education = body.education;

    if (body.maritalStatus !== undefined) updateData.maritalStatus = body.maritalStatus;
    if (body.familySize !== undefined) updateData.familySize = parseInt(body.familySize) || null;

    if (body.firstContactDate !== undefined) {
      updateData.firstContactDate = body.firstContactDate ? new Date(body.firstContactDate) : null;
    }
    if (body.lastContactDate !== undefined) {
      updateData.lastContactDate = body.lastContactDate ? new Date(body.lastContactDate) : null;
    }

    if (body.contactResult !== undefined) updateData.contactResult = body.contactResult;
    if (body.nextAction !== undefined) updateData.nextAction = body.nextAction;

    if (body.followUpDate !== undefined) {
      updateData.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;
    }

    if (body.relationship !== undefined) updateData.relationship = body.relationship;
    if (body.influenceRate !== undefined) updateData.influenceRate = parseInt(body.influenceRate) || 50;
    if (body.isPrimaryFollow !== undefined) updateData.isPrimaryFollow = Boolean(body.isPrimaryFollow);

    if (body.latitude !== undefined) updateData.latitude = body.latitude ? parseFloat(body.latitude) : null;
    if (body.longitude !== undefined) updateData.longitude = body.longitude ? parseFloat(body.longitude) : null;
    if (body.gpsVerified !== undefined) updateData.gpsVerified = Boolean(body.gpsVerified);

    if (body.isRegistryVerified !== undefined) updateData.isRegistryVerified = Boolean(body.isRegistryVerified);
    if (body.registryVoterId !== undefined) updateData.registryVoterId = body.registryVoterId || null;

    if (body.socialMedia !== undefined) {
      updateData.socialMedia = safeJsonParse(body.socialMedia);
    }

    // day of day actual voting
    if (body.votedStatus !== undefined) updateData.votedOnDay = Boolean(body.votedStatus);
    if (body.votedOnDay !== undefined) updateData.votedOnDay = Boolean(body.votedOnDay);

    const updated = await prisma.voter.update({
      where: { id: voterId },
      data: updateData,
    });

    const fullName = [updated.firstName, updated.fatherName, updated.grandfatherName, updated.fourthName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return NextResponse.json({
      ...updated,
      fullName,
      phoneNumber: updated.phone || "",
    });
  } catch (error) {
    console.error("[voters-put] failed:", error);
    return NextResponse.json({ error: "Failed to update voter" }, { status: 500 });
  }
}

// DELETE /api/voters/[id] - Deletes a voter
async function deleteHandler(
  request: NextRequest,
  { params, user }: { params: { id: string }; user: AuthenticatedUser }
) {
  try {
    const voterId = params.id;
    if (!isValidCuid(voterId)) {
      return NextResponse.json({ error: "معرف الناخب غير صالح" }, { status: 400 });
    }
    await prisma.voter.delete({ where: { id: voterId } });
    return NextResponse.json({ success: true, message: "voter deleted successfully" });
  } catch (error) {
    console.error("[voters-delete] failed:", error);
    return NextResponse.json({ error: "Failed to delete voter" }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler, { PUT: ["admin", "operator", "key_user"] });
export const DELETE = withAuth(deleteHandler, { DELETE: ["admin"] });
